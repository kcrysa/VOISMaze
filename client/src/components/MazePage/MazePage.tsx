import React, { useState, useEffect, useMemo, useRef } from "react";
import { MazeGrid } from "./MazeGrid";
import { PlayerToken } from "./PlayerToken";
import { MovementToggle } from "./MovementToggle";
import { SuccessPopup } from "../popups/SuccessPopup";
import { AbortPopup } from "../popups/AbortPopup";
import { FunFactPopup } from "../popups/FunFactPopup";
import { Button } from "../ui/Button";
import { generateMaze } from "../../utils/mazeAlgorithm";
import { formatTime } from "../../utils/mazeHelpers";
import {
  MAZE_ROWS,
  MAZE_COLS,
  CELL_SIZE,
  PATH_COFFEE_COUNT,
} from "../../config/mazeConfig";
import { useGameSession } from "../../hooks/useGameSession";
import { useGameTimer } from "../../hooks/useGameTimer";
import { usePlayerMovement } from "../../hooks/usePlayerMovement";
import { useFunFacts } from "../../hooks/useFunFacts";
import type { PlayerIcon } from "../StartPage/StartPage";
import styles from "./MazePage.module.css";

interface MazePageProps {
  onExit: () => void;
  playerIcon: PlayerIcon;
}

/**
 * Padding (in SVG units) added around the maze grid by MazeGrid so that the
 * entry/destination logos are visible outside the border. Must match the value
 * in MazeGrid.tsx: `const padding = cellSize * 2`.
 */
const GRID_PADDING = CELL_SIZE * 2;

export const MazePage: React.FC<MazePageProps> = ({ onExit, playerIcon }) => {
  const [movementMode, setMovementMode] = useState<"drag" | "click">("drag");
  const [showMovementToggle, setShowMovementToggle] = useState<boolean>(true);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "aborting">(
    "playing",
  );
  const [activeFunFact, setActiveFunFact] = useState<string | null>(null);
  const triggeredCoffeeTiles = useRef<Set<string>>(new Set());

  const { startGame, completeGame, abortGame, gameId } = useGameSession();
  const { elapsedSeconds, start, pause } = useGameTimer();
  const { getNextFunFact } = useFunFacts(playerIcon);

  // Generate maze exactly once per game session
  const mazeData = useMemo(
    () => generateMaze(MAZE_ROWS, MAZE_COLS, PATH_COFFEE_COUNT),
    [],
  );

  const {
    playerPos,
    wrongTurns,
    visitedPath,
    handleDragEnd,
    handleCellClick,
    isAtDestination,
  } = usePlayerMovement(
    mazeData.grid,
    mazeData.entry,
    mazeData.destination,
    movementMode,
  );

  // Start API session + timer on mount and check environment settings
  useEffect(() => {
    startGame(playerIcon).then((data) => {
      if (data && typeof data.showMovementToggle === "boolean") {
        setShowMovementToggle(data.showMovementToggle);
      }
      start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect win condition
  useEffect(() => {
    if (isAtDestination && gameStatus === "playing") {
      pause();
      setGameStatus("won");
      if (gameId) completeGame(gameId, elapsedSeconds, playerIcon);
    }
    // elapsedSeconds intentionally omitted — we want the value frozen at the moment of win
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAtDestination, gameStatus]);

  // Detect landing on a tile with a coffee icon inside the maze
  useEffect(() => {
    if (gameStatus !== "playing") return;
    const currentCell = mazeData.grid[playerPos.row][playerPos.col];
    const key = `${playerPos.row},${playerPos.col}`;

    if (
      currentCell.decoration === "coffee" &&
      !triggeredCoffeeTiles.current.has(key)
    ) {
      triggeredCoffeeTiles.current.add(key);
      pause();
      setActiveFunFact(getNextFunFact());
    }
  }, [playerPos, gameStatus, mazeData.grid, pause, getNextFunFact]);

  const handleFunFactContinue = () => {
    setActiveFunFact(null);
    if (gameStatus === "playing") {
      start();
    }
  };

  const handleQuit = () => {
    pause();
    setGameStatus("aborting");
  };

  const handleKeepGoing = () => {
    setGameStatus("playing");
    start();
  };

  const handleConfirmExit = () => {
    if (gameId) abortGame(gameId, elapsedSeconds, playerIcon);
    onExit();
  };

  // Total SVG dimensions (maze + padding on all sides for logos)
  const svgWidth = MAZE_COLS * CELL_SIZE + GRID_PADDING * 2;
  const svgHeight = MAZE_ROWS * CELL_SIZE + GRID_PADDING * 2;

  return (
    <div className={styles.page}>
      {/* ── HUD ── */}
      <div className={styles.hud}>
        <div className={styles.timer}>{formatTime(elapsedSeconds)}</div>
        {showMovementToggle && (
          <MovementToggle mode={movementMode} onChange={setMovementMode} />
        )}
        <Button variant="ghost" onClick={handleQuit}>
          Quit
        </Button>
      </div>

      {/* ── Maze area ── */}
      <div className={styles.mazeContainer}>
        {/*
          Single SVG contains both the grid and the player token.
          This avoids z-index / pointer-event stacking issues between two overlaid SVGs.
        */}
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: "block", maxWidth: "100%", maxHeight: "100%" }}
        >
          <MazeGrid
            grid={mazeData.grid}
            cellSize={CELL_SIZE}
            entry={mazeData.entry}
            destination={mazeData.destination}
            visitedPath={visitedPath}
            onCellClick={movementMode === "click" ? handleCellClick : undefined}
          />
          {/* Player token rendered in the same SVG so it naturally sits above walls */}
          <PlayerToken
            row={playerPos.row}
            col={playerPos.col}
            cellSize={CELL_SIZE}
            gridPadding={GRID_PADDING}
            onDragEnd={handleDragEnd}
            movementMode={movementMode}
            icon={playerIcon}
          />
        </svg>
      </div>

      {/* ── Popups ── */}
      {activeFunFact !== null && (
        <FunFactPopup
          funFact={activeFunFact}
          icon={playerIcon}
          onConfirmExit={handleFunFactContinue}
        />
      )}
      {gameStatus === "won" && (
        <SuccessPopup
          elapsedSeconds={elapsedSeconds}
          wrongTurns={wrongTurns}
          onClose={onExit}
            icon={playerIcon}
        />
      )}
      {gameStatus === "aborting" && (
        <AbortPopup
          elapsedSeconds={elapsedSeconds}
          onKeepGoing={handleKeepGoing}
          onConfirmExit={handleConfirmExit}
        />
      )}
    </div>
  );
};
