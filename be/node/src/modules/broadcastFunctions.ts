import WebSocket from 'ws';
import { Game, GameState } from '../types';

export function broadcastToAll(message: string, wss: WebSocket.Server) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function broadcastToGame(game: Game, message: any, wss: WebSocket.Server, clients: Map<WebSocket, string>) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const playerName = clients.get(client);
      if (playerName && game.players.some(p => p.name === playerName)) {
        client.send(JSON.stringify(message));
      }
    }
  });
}

export function broadcastConnectedPlayers(wss: WebSocket.Server, clients: Map<WebSocket, string>) {
  const connectedPlayers = Array.from(clients.values());
  broadcastToAll(JSON.stringify({
    type: 'player_connected',
    payload: { connectedPlayers }
  }), wss);
}

export function broadcastGameList(wss: WebSocket.Server, games: Game[]) {
  const gameList = games
    .filter(game => game.state === GameState.Waiting)
    .map(game => ({
      id: game.id,
      name: game.name,
      questionCount: game.questionCount,
      state: game.state,
      playerNames: game.playerNames,
      playerCount: game.players.length,
      winner: game.winner
    }));
  broadcastToAll(JSON.stringify({ type: 'game_list_update', payload: gameList }), wss);
}