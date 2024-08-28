import WebSocket from 'ws';
import { Game } from '../types';
import { handleMessage } from '../messageHandler';
import {
  getPlayerName, isValidPlayerName, addClientToGame, removePlayerFromGame,
} from './playerManagement';
import { removeGame, updateGameState } from './gameStateManagement';
import { sendWelcomeMessages, sendErrorAndClose, notifyPlayersOfDeparture } from './notificationFunctions';

export function handleNewConnection(webSocket: WebSocket, request: any, clients: Map<WebSocket, string>, games: Game[], wss: WebSocket.Server) {
  const playerName = getPlayerName(request);

  if (!isValidPlayerName(playerName, clients)) {
    sendErrorAndClose(webSocket, 'name_taken', 'This name is already taken. Please choose a different name.');
    return;
  }

  addClientToGame(clients, webSocket, playerName);
  sendWelcomeMessages(webSocket, playerName, wss, games, clients);

  webSocket.on('message', (message: string) => handleClientMessage(webSocket, message, games, clients, wss));
  webSocket.on('close', () => handlePlayerDisconnect(webSocket, clients, games, wss));
}

export function handleClientMessage(webSocket: WebSocket, message: string, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) {
  try {
    const data = JSON.parse(message);
    handleMessage(webSocket, data, games, clients, wss);
  } catch (error) {
    console.error('Error handling message:', error);
    webSocket.send(JSON.stringify({ type: 'error', message: 'An error occurred while processing your request' }));
  }
}

export function handlePlayerDisconnect(webSocket: WebSocket, clients: Map<WebSocket, string>, games: Game[], wss: WebSocket.Server): void {
  const playerName = clients.get(webSocket);
  clients.delete(webSocket);

  if (!playerName) return;

  const playerGames = games.filter(g => g.players.some(p => p.name === playerName));

  playerGames.forEach(game => {
    removePlayerFromGame(game, playerName);

    if (game.players.length === 0) {
      removeGame(game, games, wss);
    } else {
      notifyPlayersOfDeparture(game, playerName, wss, clients);
    }
  });

  updateGameState(wss, clients, games);
}
