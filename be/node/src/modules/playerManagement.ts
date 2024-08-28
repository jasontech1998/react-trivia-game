import WebSocket from 'ws';
import { Game } from '../types';

export function getPlayerName(request: any): string {
  return new URL(request.url, 'http://localhost').searchParams.get('name') ?? '';
}

export function isValidPlayerName(playerName: string, clients: Map<WebSocket, string>): boolean {
  return playerName !== '' && !Array.from(clients.values()).includes(playerName);
}

export function addClientToGame(clients: Map<WebSocket, string>, webSocket: WebSocket, playerName: string) {
  clients.set(webSocket, playerName);
}

export function removePlayerFromGame(game: Game, playerName: string) {
  game.players = game.players.filter(p => p.name !== playerName);
  game.playerNames = game.playerNames.filter(name => name !== playerName);
}