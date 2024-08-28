import WebSocket from 'ws';
import { Game, GameState } from '../types';
import { broadcastToAll, broadcastConnectedPlayers, broadcastGameList } from '../gameHandlers';

export function removeGame(game: Game, games: Game[], wss: WebSocket.Server) {
  const index = games.findIndex(g => g.id === game.id);
  if (index > -1) {
    games.splice(index, 1);
    broadcastToAll(JSON.stringify({
      type: 'game_destroy',
      payload: { gameId: game.id }
    }), wss);
  }
}

export function updateGameState(wss: WebSocket.Server, clients: Map<WebSocket, string>, games: Game[]) {
  broadcastConnectedPlayers(wss, clients);
  broadcastGameList(wss, games);
}

export function createGame(name: string, questionCount: number, playerName: string): Game {
  return {
    id: generateUniqueId(),
    name,
    questionCount,
    players: [{ name: playerName, score: 0, answeredIncorrectly: false }],
    state: GameState.Waiting,
    currentQuestionIndex: -1,
    questions: [],
    playerNames: [playerName],
    timer: null
  };
}

function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}