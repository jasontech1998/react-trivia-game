import React from 'react';

interface WaitingRoomProps {
  gameName: string;
  players: string[];
  isLeader: boolean;
  playerName: string;
  gameMessages: string[];
  questionCount: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameName,
  players,
  isLeader,
  playerName,
  gameMessages,
  questionCount,
}) => {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-2">Waiting Room: {gameName}</h2>
      <p className="text-sm mb-2">Questions: {questionCount}</p>
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-1">Players:</h3>
        <ul className="text-sm space-y-1">
          {players.map((player, index) => (
            <li key={player} className="flex items-center">
              <span className={`${index === 0 ? 'font-bold' : ''} ${player === playerName ? 'text-yellow-300' : ''}`}>
                {player}
              </span>
              {index === 0 && <span className="ml-1 text-xs bg-green-500 px-1 rounded">Leader</span>}
              {player === playerName && <span className="ml-1 text-xs bg-blue-500 px-1 rounded">You</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold mb-1">Game Messages:</h3>
        <div className="bg-white bg-opacity-10 rounded p-2 h-24 overflow-y-auto text-xs">
          {gameMessages.map((message, index) => (
            <p key={index} className="text-gray-200">{message}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;