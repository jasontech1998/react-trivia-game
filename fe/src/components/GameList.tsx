import React from 'react';
import { Game } from '../types';

interface GameListProps {
  games: Game[];
  onJoinGame: (gameId: string) => void;
}

const GameList: React.FC<GameListProps> = ({ games, onJoinGame }) => {
  return (
    <ul className="space-y-2">
      {games.map((game) => (
        <li key={game.id} className="bg-white bg-opacity-20 rounded-lg p-3 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">{game.name}</h3>
            <p className="text-sm text-gray-200">
              Players: {game.playerCount} / Questions: {game.questionCount}
            </p>
            {game.state !== 'waiting' && (
              <span className="text-xs font-medium bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
                Game in progress
              </span>
            )}
          </div>
          <button
            onClick={() => onJoinGame(game.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 
              ${game.state === 'waiting'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
            disabled={game.state !== 'waiting'}
          >
            {game.state === 'waiting' ? 'Join' : 'In Progress'}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default GameList;