import type { Cell } from './mazeAlgorithm';

/** Returns all neighbors reachable from (row, col) without crossing a wall */
export function getReachableNeighbors(grid: Cell[][], row: number, col: number): {row: number; col: number}[] {
  const neighbors: {row: number; col: number}[] = [];
  const cell = grid[row][col];
  
  if (!cell.walls.top && row > 0) neighbors.push({row: row - 1, col});
  if (!cell.walls.right && col < grid[0].length - 1) neighbors.push({row, col: col + 1});
  if (!cell.walls.bottom && row < grid.length - 1) neighbors.push({row: row + 1, col});
  if (!cell.walls.left && col > 0) neighbors.push({row, col: col - 1});
  
  return neighbors;
}

/** Returns the path (array of {row,col}) from start to end using BFS */
export function bfsPath(grid: Cell[][], start: {row:number;col:number}, end: {row:number;col:number}): {row:number;col:number}[] | null {
  const queue: {row: number; col: number; path: {row: number; col: number}[]}[] = [];
  const visited = new Set<string>();
  
  queue.push({ row: start.row, col: start.col, path: [start] });
  visited.add(`${start.row},${start.col}`);
  
  while (queue.length > 0) {
    const { row, col, path } = queue.shift()!;
    
    if (row === end.row && col === end.col) {
      return path;
    }
    
    const neighbors = getReachableNeighbors(grid, row, col);
    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ row: n.row, col: n.col, path: [...path, n] });
      }
    }
  }
  
  return null;
}

/** Format elapsed seconds as mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
