import WebSocket from 'ws';
import { Game } from './types';
import * as GameLifecycle from './modules/gameLifecycle';

type MessageHandler = (ws: WebSocket, payload: any, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) => void;

const messageHandlers: Record<string, MessageHandler> = {
  create: GameLifecycle.createGame,
  join: GameLifecycle.joinGame,
  start: (ws, payload, games, clients, wss) => GameLifecycle.startGame(payload.gameId, games, wss, clients),
  answer: GameLifecycle.handleAnswer,
  destroy: (ws, payload, games, clients, wss) => GameLifecycle.destroyGame(ws, payload.gameId, games, clients, wss),
  leave: GameLifecycle.leaveGame,
};

export function handleMessage(ws: WebSocket, data: any, games: Game[], clients: Map<WebSocket, string>, wss: WebSocket.Server) {
  const handler = messageHandlers[data.type];
  if (handler) {
    handler(ws, data.payload, games, clients, wss);
  } else {
    console.error(`Unknown message type: ${data.type}`);
    ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}
