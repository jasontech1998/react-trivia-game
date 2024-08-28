import React from 'react';
import { Game, Score } from '../types';

interface GameInfoProps {
  currentGame: Game | null;
  players: string[];
  scores: Score[];
  playerName: string;
}

const GameInfo: React.FC<GameInfoProps> = ({ currentGame, players, scores, playerName }) => {
  if (!currentGame) return null;

  const questionsLeft = currentGame.questionCount - ((currentGame.currentQuestionIndex || 0) + 1);
  const allScores = players.map(player => {
    const score = scores.find(s => s.name === player);
    return score || { name: player, score: 0 };
  }).sort((a, b) => b.score - a.score);

  const highestScore = allScores[0]?.score;

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-2 sm:text-2xl sm:mb-4">Game Info</h2>
      <div className="mb-2 sm:mb-4">
        <h3 className="text-lg font-semibold mb-1 sm:text-xl sm:mb-2">Scores:</h3>
        <ul className="space-y-1">
          {allScores.map((score, index) => (
            <li key={score.name} className="flex justify-between items-center text-sm sm:text-base">
              <span className={`
                ${score.score === highestScore ? 'font-bold text-yellow-300' : ''}
                ${score.name === playerName ? 'underline' : ''}
                ${index > 2 ? 'hidden sm:inline' : ''}
              `}>
                {score.name} {score.name === playerName ? '(You)' : ''}
              </span>
              <span className="bg-white bg-opacity-20 px-1 py-0.5 rounded text-xs sm:text-sm sm:px-2 sm:py-1">{score.score}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 sm:mt-4 text-sm sm:text-base">
        <h3 className="text-lg font-semibold mb-1 sm:text-xl sm:mb-2">Game Progress:</h3>
        <p>Questions Left: {questionsLeft}</p>
      </div>
    </div>
  );
};

export default GameInfo;