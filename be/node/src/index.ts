import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

import questions from './questions.json';
import utils from './utils';
import { Game, Player, Question } from './types';
import { 
  handleMessage, 
  broadcastToAll, 
  broadcastToGame,
  broadcastConnectedPlayers
} from './gameHandlers';

const PORT = 8080;
const app = express();
app.use(cors());

// Randomize the question order
utils.shuffle(questions);

const server = new Server(app);
const wss = new WebSocket.Server({ server });

const games: Game[] = [];
const clients: Map<WebSocket, string> = new Map();

function sendGameList(ws: WebSocket) {
  const gameList = games.map(game => ({
    id: game.id,
    name: game.name,
    questionCount: game.questionCount,
    state: game.state,
    playerNames: game.playerNames,
    playerCount: game.players.length,
    winner: game.winner
  }));
  ws.send(JSON.stringify({ type: 'games_list', payload: gameList }));
}

wss.on('connection', (ws: WebSocket, req: any) => {
  const playerName = new URL(req.url, 'http://localhost').searchParams.get('name');
  
  if (!playerName) {
    ws.send(JSON.stringify({ type: 'error', message: 'Player name is required' }));
    ws.close(1008, 'Player name is required');
    return;
  }

  if (Array.from(clients.values()).includes(playerName)) {
    ws.send(JSON.stringify({ type: 'name_taken', message: 'This name is already taken. Please choose a different name.' }));
    ws.close(1008, 'Player name already exists');
    return;
  }

  clients.set(ws, playerName);

  ws.send(JSON.stringify({ type: 'connection_success', playerName }));

  // Send the current list of games to the newly connected player
  sendGameList(ws);

  broadcastConnectedPlayers(wss, clients);

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data, games, clients, wss);
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'An error occurred while processing your request' }));
    }
  });

  ws.on('close', () => {
    handlePlayerDisconnect(ws);
  });
});

function handlePlayerDisconnect(ws: WebSocket) {
  const playerName = clients.get(ws);
  clients.delete(ws);
  
  if (playerName) {
    const playerGames = games.filter(g => g.players.some(p => p.name === playerName));
    
    playerGames.forEach(game => {
      game.players = game.players.filter(p => p.name !== playerName);
      game.playerNames = game.playerNames.filter(name => name !== playerName);
      
      if (game.players.length === 0) {
        const index = games.findIndex(g => g.id === game.id);
        if (index > -1) {
          games.splice(index, 1);
          broadcastToAll(JSON.stringify({
            type: 'game_destroy',
            payload: { gameId: game.id }
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
            message: `${playerName} has left the game.`
          }
        }, wss, clients);
      }
    });
  }

  broadcastConnectedPlayers(wss, clients);
}

app.get('/games', (req, res) => {
  res.json(games);
});

server.listen(PORT, () => {
  console.log(`Captrivia listening on port ${PORT}`);
});

export { games, clients, wss };
