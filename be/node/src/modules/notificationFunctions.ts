import WebSocket from 'ws';
import { Game } from '../types';
import { broadcastToGame, broadcastGameList, broadcastConnectedPlayers } from '../gameHandlers';

export function sendWelcomeMessages(webSocket: WebSocket, playerName: string, wss: WebSocket.Server, games: Game[], clients: Map<WebSocket, string>) {
  webSocket.send(JSON.stringify({ type: 'connection_success', playerName }));
  broadcastGameList(wss, games);
  broadcastConnectedPlayers(wss, clients);
}

export function notifyPlayersOfDeparture(game: Game, playerName: string, wss: WebSocket.Server, clients: Map<WebSocket, string>) {
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

export function sendErrorAndClose(webSocket: WebSocket, type: string, message: string) {
  webSocket.send(JSON.stringify({ type, message }));
  webSocket.close(1008, message);
}

export function notifyGameCreated(game: Game, wss: WebSocket.Server) {
  broadcastToGame(game, {
    type: 'game_create',
    payload: {
      id: game.id,
      name: game.name,
      questionCount: game.questionCount,
      playerCount: game.players.length,
      playerNames: game.playerNames,
      state: game.state
    }
  }, wss, new Map());
}

export function notifyGameJoined(webSocket: WebSocket, game: Game) {
  webSocket.send(JSON.stringify({
    type: 'game_joined',
    payload: {
      id: game.id,
      name: game.name,
      questionCount: game.questionCount,
      playerCount: game.players.length,
      state: game.state,
      players: game.players.map(p => p.name)
    }
  }));
}