import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface StartGameResult {
  id: string;
  startDate: string;
  playerIcon?: string | null;
  showMovementToggle?: boolean;
}

export function useGameSession() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startGame = useCallback(async (playerIcon?: string): Promise<StartGameResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIcon }),
      });
      if (!res.ok) throw new Error('Failed to start game');
      const data = await res.json();
      setGameId(data.id);
      return {
        id: data.id,
        startDate: data.startDate,
        playerIcon: data.playerIcon,
        showMovementToggle: data.showMovementToggle,
      };
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeGame = useCallback(async (id: string, elapsedTime: number, playerIcon?: string) => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/api/games/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate: new Date(), elapsedTime, playerIcon })
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const abortGame = useCallback(async (id: string, elapsedTime: number, playerIcon?: string) => {
    setIsLoading(true);
    try {
      await fetch(`${API_URL}/api/games/${id}/abort`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate: new Date(), elapsedTime, playerIcon })
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { gameId, isLoading, error, startGame, completeGame, abortGame };
}
