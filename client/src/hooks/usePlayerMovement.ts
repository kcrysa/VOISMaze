import { useState, useCallback, useMemo } from 'react';
import type { Cell } from '../utils/mazeAlgorithm';
import { getReachableNeighbors } from '../utils/mazeHelpers';

interface Pos { row: number; col: number; }

export type TrailDirection = 'top' | 'right' | 'bottom' | 'left';

/**
 * Key used in the visitedDirections map: "row,col"
 */
const posKey = (r: number, c: number) => `${r},${c}`;

/**
 * Determines the direction the player moved FROM to reach the target cell.
 * e.g. if row decreased → player moved 'top' (upward).
 */
function entryDirection(from: Pos, to: Pos): TrailDirection {
  if (to.row < from.row) return 'top';
  if (to.row > from.row) return 'bottom';
  if (to.col > from.col) return 'right';
  return 'left';
}

/**
 * Manages player position, wrong-turn tracking, and movement validation.
 *
 * Wrong-turn rule: a wrong turn is counted when the player backtracks out of
 * a dead-end cell (i.e., the cell they just left has isDeadEnd === true).
 *
 * Trail rule: visited cells are coloured. Backtracking removes the trail from
 * the cell that was popped, reverting it to the default background.
 */
export function usePlayerMovement(
  grid: Cell[][],
  entry: { row: number; col: number; side?: string },
  destination: { row: number; col: number },
  movementMode: 'drag' | 'click',
) {
  const [playerPos, setPlayerPos] = useState<Pos>({ row: entry.row, col: entry.col });
  const [wrongTurns, setWrongTurns] = useState(0);

  /**
   * visitedPath acts as a stack of positions the player has walked through.
   * When the player backtracks, we pop from the stack instead of pushing.
   * Exported so MazeGrid can colour visited cells.
   */
  const [visitedPath, setVisitedPath] = useState<Pos[]>([
    { row: entry.row, col: entry.col },
  ]);

  /**
   * visitedDirections maps "row,col" → the direction the player entered that cell.
   * When a cell is popped on backtrack, its entry is deleted from the map.
   */
  const [visitedDirections, setVisitedDirections] = useState<Map<string, TrailDirection>>(() => {
    const initial = new Map<string, TrailDirection>();
    // Give the starting cell a direction based on the entry side (rotate 90°)
    // entry.side is the maze border side the player starts from; treat it as
    // the direction the player came from.
    const sideToDir: Record<string, TrailDirection> = {
      top: 'top', bottom: 'bottom', left: 'left', right: 'right',
    };
    const startDir: TrailDirection = sideToDir[(entry as { side?: string }).side ?? 'top'] ?? 'top';
    initial.set(posKey(entry.row, entry.col), startDir);
    return initial;
  });

  const isAtDestination = useMemo(
    () => playerPos.row === destination.row && playerPos.col === destination.col,
    [playerPos, destination],
  );

  /**
   * Move the player one step to (targetRow, targetCol).
   * Validates wall collision and updates the wrong-turn counter on backtrack.
   */
  const movePlayer = useCallback(
    (targetRow: number, targetCol: number) => {
      setPlayerPos(currentPos => {
        // Validate: target must be a direct reachable neighbour of current position
        const reachable = getReachableNeighbors(grid, currentPos.row, currentPos.col);
        const isValid = reachable.some(n => n.row === targetRow && n.col === targetCol);
        if (!isValid) return currentPos; // No-op

        setVisitedPath(prevPath => {
          const newPath = [...prevPath];
          const secondLast = newPath.length >= 2 ? newPath[newPath.length - 2] : null;
          const isBacktrack =
            secondLast !== null &&
            secondLast.row === targetRow &&
            secondLast.col === targetCol;

          if (isBacktrack) {
            // The player is stepping back to the previous cell.
            // If the cell we're leaving was a dead-end, count it as a wrong turn.
            const leavingCell = grid[currentPos.row][currentPos.col];
            if (leavingCell.isDeadEnd) {
              setWrongTurns(w => w + 1);
            }
            // Remove trail from the cell we're leaving
            setVisitedDirections(prev => {
              const next = new Map(prev);
              next.delete(posKey(currentPos.row, currentPos.col));
              return next;
            });
            newPath.pop();
          } else {
            const dir = entryDirection(currentPos, { row: targetRow, col: targetCol });
            setVisitedDirections(prev => {
              const next = new Map(prev);
              next.set(posKey(targetRow, targetCol), dir);
              return next;
            });
            newPath.push({ row: targetRow, col: targetCol });
          }
          return newPath;
        });

        return { row: targetRow, col: targetCol };
      });
    },
    [grid],
  );

  /**
   * Drag mode: given the pixel delta of a completed drag gesture, determine the
   * direction and walk the player step-by-step (updating wrong turns correctly)
   * to the farthest reachable cell in that direction.
   */
  const handleDragEnd = useCallback(
    (deltaX: number, deltaY: number) => {
      if (movementMode !== 'drag') return;

      // Require at least 10px movement to count as intentional
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;

      let dir: 'top' | 'right' | 'bottom' | 'left';
      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        dir = deltaX > 0 ? 'right' : 'left';
      } else {
        dir = deltaY > 0 ? 'bottom' : 'top';
      }

      // Collect all reachable cells in this direction via wall checks
      const steps: Pos[] = [];
      setPlayerPos(currentPos => {
        let currR = currentPos.row;
        let currC = currentPos.col;

        while (true) {
          const cell = grid[currR][currC];
          let nextR = currR;
          let nextC = currC;

          if (dir === 'top' && !cell.walls.top) nextR--;
          else if (dir === 'right' && !cell.walls.right) nextC++;
          else if (dir === 'bottom' && !cell.walls.bottom) nextR++;
          else if (dir === 'left' && !cell.walls.left) nextC--;
          else break;

          if (nextR < 0 || nextR >= grid.length || nextC < 0 || nextC >= grid[0].length) break;
          steps.push({ row: nextR, col: nextC });
          currR = nextR;
          currC = nextC;
        }

        if (steps.length === 0) return currentPos;

        // Walk step-by-step so wrong-turn tracking stays accurate
        setVisitedPath(prevPath => {
          const newPath = [...prevPath];
          let curr = currentPos;

          for (const step of steps) {
            const secondLast = newPath.length >= 2 ? newPath[newPath.length - 2] : null;
            const isBacktrack =
              secondLast !== null &&
              secondLast.row === step.row &&
              secondLast.col === step.col;

            if (isBacktrack) {
              const leavingCell = grid[curr.row][curr.col];
              if (leavingCell.isDeadEnd) {
                setWrongTurns(w => w + 1);
              }
              // Remove trail from the cell being backtracked out of
              setVisitedDirections(prev => {
                const next = new Map(prev);
                next.delete(posKey(curr.row, curr.col));
                return next;
              });
              newPath.pop();
            } else {
              const stepDir = entryDirection(curr, step);
              setVisitedDirections(prev => {
                const next = new Map(prev);
                next.set(posKey(step.row, step.col), stepDir);
                return next;
              });
              newPath.push({ row: step.row, col: step.col });
            }
            curr = step;
          }
          return newPath;
        });

        return steps[steps.length - 1];
      });
    },
    [grid, movementMode],
  );

  /**
   * Click mode: move to the clicked cell if it is an adjacent reachable neighbour.
   */
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (movementMode !== 'click') return;
      movePlayer(row, col);
    },
    [movePlayer, movementMode],
  );

  return {
    playerPos,
    wrongTurns,
    visitedPath,
    visitedDirections,
    movePlayer,
    handleDragEnd,
    handleCellClick,
    isAtDestination,
  };
}
