import cors from 'cors';
import express from 'express';
import { Server } from 'http';
import WebSocket from 'ws';

import questions from './questions.json';
import utils from './utils';
import { Game } from './types';
import { handleNewConnection } from './modules/connectionHandling';

const PORT = 8080;
const app = express();
app.use(cors());

utils.shuffle(questions);

const server = new Server(app);
const wss = new WebSocket.Server({ server });

const games: Game[] = [];
const clients: Map<WebSocket, string> = new Map();

// WebSocket connection handling
wss.on('connection', (ws, req) => handleNewConnection(ws, req, clients, games, wss));

// HTTP routes
app.get('/games', (req, res) => {
  res.json(games);
});

// Server initialization
server.listen(PORT, () => {
  console.log(`Captrivia listening on port ${PORT}`);
});

export { games, clients, wss };

