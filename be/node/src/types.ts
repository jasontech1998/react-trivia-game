export interface Player {
  name: string;
  score: number;
  answeredIncorrectly: boolean;
}

export enum GameState {
  Waiting = 'waiting',
  Countdown = 'countdown',
  Question = 'question',
  Ended = 'ended',
}

export interface Game {
  id: string;
  name: string;
  questionCount: number;
  players: Player[];
  state: GameState; // This now uses the GameState enum
  currentQuestionIndex: number;
  questions: Question[];
  winner?: string;
  playerNames: string[];
  timer: NodeJS.Timeout | null;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
}
