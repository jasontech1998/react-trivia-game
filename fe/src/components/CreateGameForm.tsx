import React, { useState } from 'react';

interface CreateGameFormProps {
  onCreateGame: (gameName: string, questionCount: number) => void;
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({ onCreateGame }) => {
  const [gameName, setGameName] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateGame(gameName, questionCount);
    setGameName('');
    setQuestionCount(10);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="gameName" className="block text-sm font-medium text-gray-700 mb-1">
          Game Name
        </label>
        <input
          type="text"
          id="gameName"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="Enter game name"
        />
      </div>
      <div>
        <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-1">
          Number of Questions
        </label>
        <input
          type="number"
          id="questionCount"
          value={questionCount}
          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
          min="1"
          max="50"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
      >
        Create Game
      </button>
    </form>
  );
};

export default CreateGameForm;