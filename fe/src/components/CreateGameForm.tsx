import React, { useState } from 'react';

interface CreateGameFormProps {
  onCreateGame: (gameName: string, questionCount: number) => void;
  // Remove maxQuestions from props
}

const CreateGameForm: React.FC<CreateGameFormProps> = ({ onCreateGame }) => {
  const [gameName, setGameName] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateGame(gameName, questionCount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="gameName" className="block text-sm font-medium text-gray-700">
          Game Name
        </label>
        <input
          type="text"
          id="gameName"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">
          Number of Questions
        </label>
        <input
          type="number"
          id="questionCount"
          value={questionCount}
          onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value)))}
          min="1"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
      >
        Create Game
      </button>
    </form>
  );
};

export default CreateGameForm;