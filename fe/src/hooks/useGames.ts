import { useState, useEffect } from 'react';
import { Api } from '../api';
import { Game } from '../types';

const api = new Api('http://localhost:8080');

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      const fetchedGames = await api.getGames();
      setGames(fetchedGames);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch game list:', error);
      setError('Failed to update game list. Please refresh the page.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return { games, setGames, isLoading, error, fetchGames };
}