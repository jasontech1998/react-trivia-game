import React from 'react';
import { Game } from '../types';

interface GameListProps {
  games: Game[];
  onJoinGame: (gameId: string) => void;
}

const GameList: React.FC<GameListProps> = ({ games, onJoinGame }) => {
  const waitingGames = games.filter(game => game.state === 'waiting');

  return (
    <ul className="space-y-4">
      {waitingGames.map((game) => (
        <li key={game.id} className="bg-white bg-opacity-20 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-2">{game.name}</h2>
          {game.playerNames && (
            <div className="text-white mb-2">
              <p>Players in waiting room:</p>
              <ul className="list-disc list-inside">
                {game.playerNames.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
            </div>
          )}
          <button 
            onClick={() => onJoinGame(game.id)} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out text-sm"
          >
            Join Game
          </button>
        </li>
      ))}
      {waitingGames.length === 0 && (
        <li className="text-white">No games available to join.</li>
      )}
    </ul>
  );
};

export default GameList;