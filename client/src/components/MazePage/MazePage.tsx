import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { MazeGrid } from "./MazeGrid";
import { PlayerToken } from "./PlayerToken";
import { SuccessPopup } from "../popups/SuccessPopup";
import { AbortPopup } from "../popups/AbortPopup";
import { FunFactPopup } from "../popups/FunFactPopup";
import { Button } from "../ui/Button";
import { generateMaze } from "../../utils/mazeAlgorithm";
import { formatTime, getReachableNeighbors } from "../../utils/mazeHelpers";
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
    playerPosRef,
    wrongTurns,
    visitedPath,
    movePlayer,
    isAtDestination,
  } = usePlayerMovement(
    mazeData.grid,
    mazeData.entry,
    mazeData.destination,
    "drag",
  );

  // Start API session + timer on mount and check environment settings
  useEffect(() => {
    startGame(playerIcon).then(() => {
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

  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);

  // Fallback conversion from screen coordinates to maze grid cell (row, col)
  const getCellFromCoords = useCallback(
    (clientX: number, clientY: number): { row: number; col: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      const scaleX = svgWidth / rect.width;
      const scaleY = svgHeight / rect.height;
      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;

      const col = Math.floor((svgX - GRID_PADDING) / CELL_SIZE);
      const row = Math.floor((svgY - GRID_PADDING) / CELL_SIZE);

      if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) {
        return null;
      }
      return { row, col };
    },
    [svgWidth, svgHeight],
  );

  // Step to a target cell: works identically to a single click, one adjoining cell at a time
  const stepToCell = useCallback(
    (targetRow: number, targetCol: number) => {
      if (activeFunFact !== null || gameStatus !== "playing") return;
      const current = playerPosRef.current;
      if (current.row === targetRow && current.col === targetCol) return;

      // 1. Direct reachable neighbor
      if (movePlayer(targetRow, targetCol)) {
        return;
      }

      // 2. Intermediate bridging step if dragged quickly across 2 cells in 1 tick
      const neighbors = getReachableNeighbors(
        mazeData.grid,
        current.row,
        current.col,
      );
      for (const n of neighbors) {
        const nextNeighbors = getReachableNeighbors(
          mazeData.grid,
          n.row,
          n.col,
        );
        if (nextNeighbors.some((nn) => nn.row === targetRow && nn.col === targetCol)) {
          if (movePlayer(n.row, n.col)) {
            movePlayer(targetRow, targetCol);
          }
          return;
        }
      }
    },
    [activeFunFact, gameStatus, mazeData.grid, movePlayer],
  );

  // Pointer down on a cell: start drag and step into the cell if adjoining
  const handleCellPointerDown = useCallback(
    (row: number, col: number) => {
      if (activeFunFact !== null || gameStatus !== "playing") return;
      isDraggingRef.current = true;
      stepToCell(row, col);
    },
    [activeFunFact, gameStatus, stepToCell],
  );

  // Mouse hover over a cell while dragging (desktop)
  const handleCellPointerEnter = useCallback(
    (row: number, col: number) => {
      if (!isDraggingRef.current) return;
      stepToCell(row, col);
    },
    [stepToCell],
  );

  // Continuous movement tracking for touch devices and tablets
  const handlePointMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;

      // 1. Direct hit-test from DOM element under cursor/finger
      const elem = document.elementFromPoint(clientX, clientY);
      const cellAttr = elem?.getAttribute("data-cell");
      if (cellAttr) {
        const [r, c] = cellAttr.split(",").map(Number);
        stepToCell(r, c);
        return;
      }

      // 2. Fallback to coordinate projection if element is off cell rect
      const fallbackCell = getCellFromCoords(clientX, clientY);
      if (fallbackCell) {
        stepToCell(fallbackCell.row, fallbackCell.col);
      }
    },
    [stepToCell, getCellFromCoords],
  );

  const handleDragStop = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Global window listeners for drag continuation and release
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      handlePointMove(e.clientX, e.clientY);
    };
    const onPointerUp = () => {
      handleDragStop();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      if (e.cancelable) e.preventDefault();
      if (e.touches.length > 0) {
        handlePointMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handleDragStop();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [handlePointMove, handleDragStop]);

  return (
    <div className={styles.page}>
      {/* ── HUD ── */}
      <div className={styles.hud}>
        <div className={styles.timer}>{formatTime(elapsedSeconds)}</div>
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
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          onPointerDown={() => {
            isDraggingRef.current = true;
          }}
          onTouchStart={() => {
            isDraggingRef.current = true;
          }}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "100%",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <MazeGrid
            grid={mazeData.grid}
            cellSize={CELL_SIZE}
            entry={mazeData.entry}
            destination={mazeData.destination}
            visitedPath={visitedPath}
            onCellClick={stepToCell}
            onCellPointerDown={handleCellPointerDown}
            onCellPointerEnter={handleCellPointerEnter}
          />
          {/* Player token rendered in the same SVG so it naturally sits above walls */}
          <PlayerToken
            row={playerPos.row}
            col={playerPos.col}
            cellSize={CELL_SIZE}
            gridPadding={GRID_PADDING}
            movementMode={"drag"}
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
