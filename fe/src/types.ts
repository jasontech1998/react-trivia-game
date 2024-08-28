export interface Game {
  id: string;
  name: string;
  questionCount: number;
  playerCount: number;
  playerNames: string[];
  state: 'waiting' | 'countdown' | 'question' | 'ended';
  winner?: string;
}

export interface Player {
  name: string;
  score: number;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
}

export interface GameListItem {
  id: string;
  name: string;
  questionCount: number;
  state: Game['state'];
  playerNames: string[];
  playerCount: number;
  winner?: string;
}

export interface Score {
  name: string;
  score: number;
}

export interface GameJoinedPayload {
  id: string;
  name: string;
  questionCount: number;
  playerCount: number;
  state: Game['state'];
  players: string[];
}

export interface QuestionPayload {
  gameId: string;
  questionIndex: number;
  totalQuestions: number;
  question: string;
  options: string[];
}

export interface CorrectAnswerPayload {
  playerName: string;
  gameId: string;
  correctAnswer: string;
  scores: Score[];
}

export interface GameEndPayload {
  gameId: string;
  scores: Score[];
  winner: string;
}