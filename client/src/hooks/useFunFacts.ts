import { useCallback, useRef } from "react";
import type { PlayerIcon } from "../components/StartPage/StartPage";
import funFactsData from "../data/funFacts.json";

export interface FunFactItem {
  playerIcon: "dog" | "cat";
  funFact: string;
}

const funFacts = funFactsData as FunFactItem[];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useFunFacts(playerIcon: PlayerIcon) {
  const lastPlayerIconRef = useRef<PlayerIcon | null>(null);
  const remainingFactsRef = useRef<string[]>([]);

  const getNextFunFact = useCallback((): string => {
    // If player icon changed, reset queue
    if (lastPlayerIconRef.current !== playerIcon) {
      lastPlayerIconRef.current = playerIcon;
      remainingFactsRef.current = [];
    }

    // Refill and reshuffle once all items have been shown
    if (remainingFactsRef.current.length === 0) {
      const filtered = funFacts
        .filter((item) => item.playerIcon === playerIcon)
        .map((item) => item.funFact);
      remainingFactsRef.current = shuffle(filtered);
    }

    return remainingFactsRef.current.pop() ?? "";
  }, [playerIcon]);

  return { getNextFunFact };
}
