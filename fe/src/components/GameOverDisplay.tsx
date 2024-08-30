import React from 'react';
import { Score } from '../types';

interface GameOverDisplayProps {
  scores: Score[];
  playerName: string;
  leavingCountdown: number | null;
}

const GameOverDisplay: React.FC<GameOverDisplayProps> = ({ scores, playerName, leavingCountdown }) => {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const winner = sortedScores[0];
  const playerScore = sortedScores.find(score => score.name === playerName);
  const playerRank = sortedScores.findIndex(score => score.name === playerName) + 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h2 className="text-3xl font-bold mb-4 text-emerald-600">Game Over!</h2>
      <div className="mb-6">
        {winner.name === playerName ? (
          <h3 className="text-2xl font-semibold text-cyan-500">
            Congratulations! You won!
          </h3>
        ) : (
          <h3 className="text-2xl font-semibold text-indigo-500">
            {winner.name} wins!
          </h3>
        )}
        <p className="text-xl text-gray-700 mt-2">Winning Score: {winner.score}</p>
      </div>
      {winner.name !== playerName && (
        <div className="mb-6 bg-indigo-100 rounded-lg p-4">
          <h4 className="text-xl font-semibold mb-2 text-indigo-700">Your Result</h4>
          <p className="text-lg text-indigo-600">Rank: {playerRank} out of {sortedScores.length}</p>
          <p className="text-lg text-indigo-600">Your Score: {playerScore?.score}</p>
        </div>
      )}
      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2 text-gray-700">Final Scores:</h4>
        <ul className="space-y-2">
          {sortedScores.map((score, index) => (
            <li 
              key={index} 
              className={`text-lg ${score.name === playerName ? 'font-bold' : ''} ${
                index === 0 ? 'text-emerald-500' : 
                index === 1 ? 'text-cyan-500' : 
                index === 2 ? 'text-indigo-500' : 'text-gray-600'
              }`}
            >
              {index + 1}. {score.name}: {score.score} {score.name === playerName && "(You)"}
            </li>
          ))}
        </ul>
      </div>
      {leavingCountdown !== null && (
        <p className="text-gray-600">Returning to lobby in {leavingCountdown} seconds...</p>
      )}
    </div>
  );
};

export default GameOverDisplay;