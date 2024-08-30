import React from 'react';
import { Score } from '../types';

interface GameOverDisplayProps {
  scores: Score[];
  playerName: string;
  onReturnToLobby: () => void;
}

const GameOverDisplay: React.FC<GameOverDisplayProps> = ({ scores, playerName, onReturnToLobby }) => {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const winner = sortedScores[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h2 className="text-3xl font-bold mb-6 text-emerald-600">Game Over!</h2>
      <div className="mb-6 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg p-6 shadow-inner">
        <h3 className="text-2xl font-semibold mb-2 text-indigo-700">
          {winner.name === playerName ? 'Congratulations! You won!' : `${winner.name} wins!`}
        </h3>
        <p className="text-xl text-indigo-600">Winning Score: {winner.score}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-4 text-gray-700">Final Scores:</h4>
        <ul className="space-y-2">
          {sortedScores.map((score, index) => (
            <li 
              key={index} 
              className={`text-lg flex justify-between items-center p-2 rounded-lg ${
                score.name === playerName ? 'font-bold bg-yellow-100' : 'bg-gray-100'
              }`}
            >
              <span className={`flex items-center ${
                index === 0 ? 'text-yellow-600' : 
                index === 1 ? 'text-gray-600' : 
                index === 2 ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                {index + 1}. {score.name} {score.name === playerName && "(You)"}
              </span>
              <span className="font-semibold">{score.score}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onReturnToLobby}
        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-2 px-4 rounded-md hover:from-emerald-600 hover:to-cyan-600 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        Return to Lobby
      </button>
    </div>
  );
};

export default GameOverDisplay;