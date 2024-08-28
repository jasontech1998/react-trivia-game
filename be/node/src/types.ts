import { Timeout } from 'timers';

export interface Player {
  name: string;
  score: number;
  answeredIncorrectly: boolean;
}

export interface Game {
  id: string;
  name: string;
  questionCount: number;
  players: Player[];
  state: 'waiting' | 'countdown' | 'question' | 'ended';
  currentQuestionIndex: number;
  questions: Question[];
  winner?: string;
  playerNames: string[];
  timer: Timeout | null;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
}