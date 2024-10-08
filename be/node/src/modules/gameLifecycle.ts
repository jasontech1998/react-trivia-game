import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameState } from '../types';
import utils from '../utils';
import questions from '../questions.json';
import { broadcastToAll, broadcastToGame, broadcastGameList } from './broadcastFunctions';

export function createGame(ws: WebSocket, payload: { name: string; question_count: number }, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) {
  const playerName = clients.get(ws);
  if (!playerName) return;

  const newGame: Game = {
    id: uuidv4(),
    name: payload.name,
    questionCount: payload.question_count,
    players: [{ name: playerName, score: 0, answeredIncorrectly: false }],
    state: GameState.Waiting,
    currentQuestionIndex: -1,
    questions: [],
    playerNames: [playerName],
    timer: null,
  };

  games.push(newGame);

  broadcastToAll(JSON.stringify({
    type: 'game_create',
    payload: {
      id: newGame.id,
      name: newGame.name,
      questionCount: newGame.questionCount,
      playerCount: 1,
      playerNames: newGame.playerNames,
      state: newGame.state,
    },
  }), wss);

  ws.send(JSON.stringify({
    type: 'game_joined',
    payload: {
      id: newGame.id,
      name: newGame.name,
      questionCount: newGame.questionCount,
      playerCount: 1,
      state: newGame.state,
      players: newGame.playerNames,
    },
  }));

  broadcastGameList(wss, games);
}

export function joinGame(ws: WebSocket, payload: { gameId: string }, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) {
  const game = games.find(g => g.id === payload.gameId);
  if (!game) {
    ws.send(JSON.stringify({ type: 'game_join_failed', payload: { message: 'Game not found' } }));
    return;
  }

  if (game.state !== GameState.Waiting) {
    ws.send(JSON.stringify({ type: 'game_join_failed', payload: { message: 'Game has already started' } }));
    return;
  }

  const playerName = clients.get(ws);
  if (!playerName) {
    ws.send(JSON.stringify({ type: 'game_join_failed', payload: { message: 'Player not found' } }));
    return;
  }

  if (game.players.some(p => p.name === playerName)) {
    ws.send(JSON.stringify({
      type: 'game_joined',
      payload: {
        id: game.id,
        name: game.name,
        questionCount: game.questionCount,
        playerCount: game.players.length,
        state: game.state,
        players: game.players.map(p => p.name),
      },
    }));
    return;
  }

  game.players.push({ name: playerName, score: 0, answeredIncorrectly: false });
  game.playerNames.push(playerName);

  broadcastToAll(JSON.stringify({
    type: 'game_update',
    payload: {
      id: game.id,
      name: game.name,
      questionCount: game.questionCount,
      playerCount: game.players.length,
      playerNames: game.playerNames,
      state: game.state,
    },
  }), wss);

  ws.send(JSON.stringify({
    type: 'game_joined',
    payload: {
      id: game.id,
      name: game.name,
      questionCount: game.questionCount,
      playerCount: game.players.length,
      state: game.state,
      players: game.players.map(p => p.name),
    },
  }));

  broadcastToGame(game, {
    type: 'player_joined',
    payload: {
      playerName,
      gameId: game.id,
      playerCount: game.players.length,
      players: game.players.map(p => p.name),
      message: `${playerName} has joined the game.`,
    },
  }, wss, clients);

  broadcastToAll(JSON.stringify({
    type: 'game_update',
    payload: {
      id: game.id,
      playerCount: game.players.length,
      playerNames: game.playerNames,
    },
  }), wss);
}

export function startGame(gameId: string, games: Game[], wss: WebSocket.Server, clients: Map<WebSocket, string>) {
  const game = games.find(g => g.id === gameId);
  if (!game || game.state !== GameState.Waiting || game.players.length < 2) return;

  game.state = GameState.Countdown;
  game.currentQuestionIndex = -1;

  if (questions.length === 0) {
    console.error('No questions available');
    return;
  }

  game.questions = utils.shuffle([...questions]).slice(0, game.questionCount);

  broadcastToGame(game, {
    type: 'game_start',
    payload: {
      gameId: game.id,
      players: game.playerNames,
    },
  }, wss, clients);

  broadcastToAll(JSON.stringify({
    type: 'game_update',
    payload: {
      id: game.id,
      name: game.name,
      questionCount: game.questionCount,
      playerCount: game.players.length,
      playerNames: game.playerNames,
      state: game.state,
    },
  }), wss);

  let countdown = 3;
  const countdownInterval = setInterval(() => {
    broadcastToGame(game, {
      type: 'countdown',
      payload: { gameId: game.id, countdown },
    }, wss, clients);
    countdown--;
    if (countdown < 0) {
      clearInterval(countdownInterval);
      askQuestion(game, games, wss, clients);
    }
  }, 1000);
}

export function askQuestion(game: Game, games: Game[], wss: WebSocket.Server, clients: Map<WebSocket, string>) {
  if (game.currentQuestionIndex >= game.questionCount - 1) {
    endGame(game, games, wss, clients);
    return;
  }

  game.currentQuestionIndex++;
  game.state = GameState.Question;
  const question = game.questions[game.currentQuestionIndex];

  broadcastToGame(game, {
    type: 'question',
    payload: {
      gameId: game.id,
      questionIndex: game.currentQuestionIndex,
      totalQuestions: game.questionCount,
      question: question.questionText,
      options: question.options,
    },
  }, wss, clients);

  broadcastToAll(JSON.stringify({
    type: 'game_update',
    payload: {
      id: game.id,
      name: game.name,
      questionCount: game.questionCount,
      playerCount: game.players.length,
      playerNames: game.playerNames,
      state: game.state,
    },
  }), wss);

  if (game.timer) {
    clearTimeout(game.timer);
  }

  game.timer = setTimeout(() => {
    if (game.state === GameState.Question) {
      handleTimeUp(game, games, wss, clients);
    }
  }, 10000);
}

export function handleAnswer(ws: WebSocket, payload: { gameId: string, answer: string }, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) {
  const game = games.find(g => g.id === payload.gameId);
  if (!game || game.state !== GameState.Question) return;

  const playerName = clients.get(ws);
  if (!playerName) return;

  const player = game.players.find(p => p.name === playerName);
  if (!player || player.answeredIncorrectly) return;

  const currentQuestion = game.questions[game.currentQuestionIndex];
  const isCorrect = payload.answer === currentQuestion.options[currentQuestion.correctIndex];

  if (isCorrect) {
    player.score++;
    broadcastToGame(game, {
      type: 'correct_answer',
      payload: {
        playerName,
        gameId: game.id,
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        scores: game.players.map(p => ({ name: p.name, score: p.score })),
      },
    }, wss, clients);

    if (game.timer) {
      clearTimeout(game.timer);
    }

    game.timer = setTimeout(() => {
      game.players.forEach(p => p.answeredIncorrectly = false);
      askQuestion(game, games, wss, clients);
    }, 3000);
  } else {
    player.answeredIncorrectly = true;
    broadcastToGame(game, {
      type: 'incorrect_answer',
      payload: { playerName, gameId: game.id },
    }, wss, clients);

    if (allPlayersAnsweredIncorrectly(game)) {
      handleTimeUp(game, games, wss, clients);
    }
  }
}

export function endGame(game: Game, games: Game[], wss: WebSocket.Server, clients: Map<WebSocket, string>) {
  game.state = GameState.Ended;
  const winner = game.players.reduce((prev, current) => ((prev.score > current.score) ? prev : current));
  game.winner = winner.name;
  broadcastToGame(game, {
    type: 'game_end',
    payload: {
      gameId: game.id,
      scores: game.players.map(p => ({ name: p.name, score: p.score })),
      winner: winner.name,
    },
  }, wss, clients);

  const gameIndex = games.findIndex(g => g.id === game.id);
  if (gameIndex !== -1) {
    games.splice(gameIndex, 1);
  }

  broadcastGameList(wss, games);
}

export function destroyGame(ws: WebSocket, gameId: string, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) {
  const game = games.find(g => g.id === gameId);
  if (!game) return;

  const playerName = clients.get(ws);
  if (!playerName || game.players[0].name !== playerName) return;

  const index = games.findIndex(g => g.id === gameId);
  if (index > -1) {
    games.splice(index, 1);
  }

  broadcastToGame(game, {
    type: 'game_destroyed',
    payload: {
      gameId,
      message: 'The game has been destroyed by the creator.',
    },
  }, wss, clients);

  broadcastToAll(JSON.stringify({
    type: 'game_destroy',
    payload: { gameId },
  }), wss);

  broadcastGameList(wss, games);
}

export function leaveGame(ws: WebSocket, payload: { gameId: string }, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) {
  const game = games.find(g => g.id === payload.gameId);
  if (!game) return;

  const playerName = clients.get(ws);
  if (!playerName) return;

  game.players = game.players.filter(p => p.name !== playerName);
  game.playerNames = game.playerNames.filter(name => name !== playerName);

  if (game.players.length === 0) {
    const index = games.findIndex(g => g.id === game.id);
    if (index > -1) {
      games.splice(index, 1);
      broadcastToAll(JSON.stringify({
        type: 'game_destroy',
        payload: { gameId: game.id },
      }), wss);
    }
  } else {
    broadcastToGame(game, {
      type: 'player_left',
      payload: {
        playerName,
        gameId: game.id,
        playerCount: game.players.length,
        players: game.players.map(p => p.name),
        player_names: game.playerNames,
        message: `${playerName} has left the game.`,
      },
    }, wss, clients);
  }

  ws.send(JSON.stringify({
    type: 'game_left',
    payload: { gameId: game.id },
  }));

  broadcastGameList(wss, games);
}

function handleTimeUp(game: Game, games: Game[], wss: WebSocket.Server, clients: Map<WebSocket, string>) {
  const currentQuestion = game.questions[game.currentQuestionIndex];
  broadcastToGame(game, {
    type: 'time_up',
    payload: {
      gameId: game.id,
      correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
    },
  }, wss, clients);

  if (game.timer) {
    clearTimeout(game.timer);
  }

  game.timer = setTimeout(() => {
    game.players.forEach(p => p.answeredIncorrectly = false);
    askQuestion(game, games, wss, clients);
  }, 3000);
}

function allPlayersAnsweredIncorrectly(game: Game): boolean {
  return game.players.every(p => p.answeredIncorrectly);
}
