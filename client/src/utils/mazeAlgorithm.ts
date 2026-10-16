import { COFFEE_DECORATION_RATIO, DESTINATION_RADIUS } from '../config/mazeConfig';
import { getReachableNeighbors } from './mazeHelpers';

export interface Cell {
  row: number;
  col: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
  isEntry: boolean;
  isDestination: boolean;
  isDeadEnd: boolean;
  branchLength: number;
  decoration: 'coffee' | null;
}

export interface MazeData {
  grid: Cell[][];
  entry: { row: number; col: number; side: 'top' | 'bottom' | 'left' | 'right' };
  destination: { row: number; col: number };
}

export function generateMaze(rows: number, cols: number): MazeData {
  const grid: Cell[][] = [];
  
  // 1. Initialize grid
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
        isEntry: false,
        isDestination: false,
        isDeadEnd: false,
        branchLength: 0,
        decoration: null,
      });
    }
    grid.push(row);
  }

  // 2. Choose entry point
  const sides = ['top', 'bottom', 'left', 'right'] as const;
  const entrySide = sides[Math.floor(Math.random() * sides.length)];
  let entryRow = 0;
  let entryCol = 0;

  if (entrySide === 'top') {
    entryCol = Math.floor(Math.random() * cols);
    grid[0][entryCol].walls.top = false;
  } else if (entrySide === 'bottom') {
    entryRow = rows - 1;
    entryCol = Math.floor(Math.random() * cols);
    grid[rows - 1][entryCol].walls.bottom = false;
  } else if (entrySide === 'left') {
    entryRow = Math.floor(Math.random() * rows);
    grid[entryRow][0].walls.left = false;
  } else if (entrySide === 'right') {
    entryRow = Math.floor(Math.random() * rows);
    entryCol = cols - 1;
    grid[entryRow][cols - 1].walls.right = false;
  }

  grid[entryRow][entryCol].isEntry = true;
  const entry = { row: entryRow, col: entryCol, side: entrySide };

  // 3. DFS for maze generation
  const stack: Cell[] = [];
  const startCell = grid[entryRow][entryCol];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Get unvisited neighbors
    const neighbors: {cell: Cell, dir: 'top'|'right'|'bottom'|'left'}[] = [];
    if (current.row > 0 && !grid[current.row - 1][current.col].visited) neighbors.push({cell: grid[current.row - 1][current.col], dir: 'top'});
    if (current.col < cols - 1 && !grid[current.row][current.col + 1].visited) neighbors.push({cell: grid[current.row][current.col + 1], dir: 'right'});
    if (current.row < rows - 1 && !grid[current.row + 1][current.col].visited) neighbors.push({cell: grid[current.row + 1][current.col], dir: 'bottom'});
    if (current.col > 0 && !grid[current.row][current.col - 1].visited) neighbors.push({cell: grid[current.row][current.col - 1], dir: 'left'});

    if (neighbors.length > 0) {
      // Random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Remove walls
      if (next.dir === 'top') { current.walls.top = false; next.cell.walls.bottom = false; }
      else if (next.dir === 'right') { current.walls.right = false; next.cell.walls.left = false; }
      else if (next.dir === 'bottom') { current.walls.bottom = false; next.cell.walls.top = false; }
      else if (next.dir === 'left') { current.walls.left = false; next.cell.walls.right = false; }
      
      next.cell.visited = true;
      stack.push(next.cell);
    } else {
      stack.pop();
    }
  }

  // 4. Identify destination cell
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  let bestDest: Cell | null = null;
  let bestDist = Infinity;

  const candidateDests: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === entryRow && c === entryCol) continue;
      const dist = Math.abs(r - centerRow) + Math.abs(c - centerCol);
      if (dist <= DESTINATION_RADIUS) {
        candidateDests.push(grid[r][c]);
      }
    }
  }

  // Try to find a dead end near center
  let deadEndsNearCenter = candidateDests.filter(c => {
    let openWalls = 0;
    if (!c.walls.top) openWalls++;
    if (!c.walls.right) openWalls++;
    if (!c.walls.bottom) openWalls++;
    if (!c.walls.left) openWalls++;
    return openWalls === 1;
  });

  let candidatesToSearch = deadEndsNearCenter.length > 0 ? deadEndsNearCenter : candidateDests;
  
  for (const c of candidatesToSearch) {
    const dist = Math.abs(c.row - centerRow) + Math.abs(c.col - centerCol);
    if (dist < bestDist) {
      bestDist = dist;
      bestDest = c;
    }
  }

  if (!bestDest) {
    bestDest = grid[centerRow][centerCol];
  }
  bestDest.isDestination = true;
  const destination = { row: bestDest.row, col: bestDest.col };

  // 5. Identify all dead ends and calculate branch length
  const deadEnds: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell.isEntry || cell.isDestination) continue;
      let openWalls = 0;
      if (!cell.walls.top) openWalls++;
      if (!cell.walls.right) openWalls++;
      if (!cell.walls.bottom) openWalls++;
      if (!cell.walls.left) openWalls++;
      
      if (openWalls === 1) {
        cell.isDeadEnd = true;
        deadEnds.push(cell);
      }
    }
  }

  // Calculate branch length using a simple backward trace until junction
  for (const de of deadEnds) {
    let length = 1;
    let curr = de;
    let prev: Cell | null = null;
    
    while (true) {
      const neighbors = getReachableNeighbors(grid, curr.row, curr.col);
      if (neighbors.length > 2 || (neighbors.length === 1 && length > 1)) {
        break; // Junction reached
      }
      const nextCoords = neighbors.find(n => !prev || (n.row !== prev.row || n.col !== prev.col));
      if (!nextCoords) break;
      prev = curr;
      curr = grid[nextCoords.row][nextCoords.col];
      length++;
    }
    de.branchLength = length;
  }

  // 8. Assign decorations
  for (const de of deadEnds) {
    if (Math.random() < COFFEE_DECORATION_RATIO) {
      de.decoration = 'coffee';
    }
  }

  return { grid, entry, destination };
}
