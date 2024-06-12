import cors from 'cors';
import express from 'express';

import questions from './questions.json';
import utils from './utils';

const PORT = 8080;
const app = express();
app.use(cors());

// Randomize the question order
utils.shuffle(questions);

// Configure a single endpoint for returning hardcoded games
// TODO: Fix this so that the data is not hardcoded and is in the right
// shape that the frontend expects
app.get('/games', (req, res) => {
  const games = [
    { name: 'Game 1', questionCount: 5, status: 'countdown' },
    { name: "John's Game", questionCount: 3, status: 'waiting' },
    { name: 'Unnamed Game', questionCount: 6, status: 'ended' },
  ];
  res.json(games);
});

// Start up the server
app.listen(PORT, () => {
  console.log(`Captrivia listening on port ${PORT}`);
});
