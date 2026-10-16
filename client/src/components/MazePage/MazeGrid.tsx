import React from "react";
import { WALL_STROKE } from "../../config/mazeConfig";
import type { Cell, MazeData } from "../../utils/mazeAlgorithm";
import { CodeCampIcon } from "../icons/CodeCampIcon";
import { CoffeeIcon } from "../icons/CoffeeIcon";
import { VOISIcon } from "../icons/VOISIcon";

const LOGO_SIZE = 90;

// ─── Component ────────────────────────────────────────────────────────────────

interface Pos {
  row: number;
  col: number;
}

interface MazeGridProps {
  grid: Cell[][];
  cellSize: number;
  entry: MazeData["entry"];
  destination: { row: number; col: number };
  /** Ordered list of visited positions (oldest first, current last) */
  visitedPath: Pos[];
  /** Called in click-to-move mode when the user clicks a cell */
  onCellClick?: (row: number, col: number) => void;
}

export const MazeGrid: React.FC<MazeGridProps> = ({
  grid,
  cellSize,
  entry,
  destination,
  visitedPath,
  onCellClick,
}) => {
  const rows = grid.length;
  const cols = grid[0].length;

  /** Extra padding around the SVG so logos outside the border are visible */
  const padding = cellSize * 2;
  const ox = padding;
  const oy = padding;

  const halfCell = cellSize / 2;
  const halfLogo = LOGO_SIZE / 2;

  // Build a lookup map: "row,col" → index in visitedPath
  const visitedMap = new Map<string, number>();
  visitedPath.forEach((p, i) => visitedMap.set(`${p.row},${p.col}`, i));

  // ── CodeCamp logo position ──
  let entryLogoX = 0;
  let entryLogoY = 0;
  if (entry.side === "top") {
    entryLogoX = ox + entry.col * cellSize + halfCell - halfLogo;
    entryLogoY = oy - LOGO_SIZE - 4 - 40;
  } else if (entry.side === "bottom") {
    entryLogoX = ox + entry.col * cellSize + halfCell - halfLogo;
    entryLogoY = oy + rows * cellSize + 4 + 40;
  } else if (entry.side === "left") {
    entryLogoX = ox - LOGO_SIZE - 4 - 40;
    entryLogoY = oy + entry.row * cellSize + halfCell - halfLogo;
  } else {
    entryLogoX = ox + cols * cellSize + 4 + 40;
    entryLogoY = oy + entry.row * cellSize + halfCell - halfLogo;
  }

  // ── VOIS logo position (centred in destination cell) ──
  const destLogoX = ox + destination.col * cellSize + halfCell - halfLogo;
  const destLogoY = oy + destination.row * cellSize + halfCell - halfLogo;

  return (
    <g>
      {/* ── Cell backgrounds & continuous trail ── */}
      {grid.map((row, r) =>
        row.map((_, c) => {
          const idx = visitedMap.get(`${r},${c}`);
          const fill =
            idx !== undefined
              ? "var(--color-primary-dim)"
              : "var(--color-path-bg)";

          return (
            <rect
              key={`bg-${r}-${c}`}
              x={ox + c * cellSize}
              y={oy + r * cellSize}
              width={cellSize}
              height={cellSize}
              fill={fill}
              onClick={() => onCellClick?.(r, c)}
              style={{ cursor: onCellClick ? "pointer" : "default" }}
            />
          );
        }),
      )}

      {/* ── Coffee decorations (dead-end cells) ── */}
      {grid.map((row, r) =>
        row.map((cell, c) => {
          if (!cell.decoration) return null;
          const cx = ox + c * cellSize + halfCell - 25;
          const cy = oy + r * cellSize + halfCell - 25;
          return (
            <g
              key={`dec-${r}-${c}`}
              transform={`translate(${cx}, ${cy})`}
              opacity={0.8}
            >
              <CoffeeIcon onHover={() => {}} />
            </g>
          );
        }),
      )}

      {/* ── Destination logo (VOIS) ── */}
      <g transform={`translate(${destLogoX}, ${destLogoY})`}>
        <VOISIcon size={`${LOGO_SIZE}px`} />
      </g>

      {/* ── Walls ── */}
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const x = ox + c * cellSize;
          const y = oy + r * cellSize;
          const wallLines: React.ReactElement[] = [];

          if (cell.walls.top) {
            wallLines.push(
              <line
                key={`t-${r}-${c}`}
                x1={x}
                y1={y}
                x2={x + cellSize}
                y2={y}
                stroke="var(--color-wall)"
                strokeWidth={WALL_STROKE}
                strokeLinecap="round"
              />,
            );
          }
          if (cell.walls.left) {
            wallLines.push(
              <line
                key={`l-${r}-${c}`}
                x1={x}
                y1={y}
                x2={x}
                y2={y + cellSize}
                stroke="var(--color-wall)"
                strokeWidth={WALL_STROKE}
                strokeLinecap="round"
              />,
            );
          }
          if (r === rows - 1 && cell.walls.bottom) {
            wallLines.push(
              <line
                key={`b-${r}-${c}`}
                x1={x}
                y1={y + cellSize}
                x2={x + cellSize}
                y2={y + cellSize}
                stroke="var(--color-wall)"
                strokeWidth={WALL_STROKE}
                strokeLinecap="round"
              />,
            );
          }
          if (c === cols - 1 && cell.walls.right) {
            wallLines.push(
              <line
                key={`r-${r}-${c}`}
                x1={x + cellSize}
                y1={y}
                x2={x + cellSize}
                y2={y + cellSize}
                stroke="var(--color-wall)"
                strokeWidth={WALL_STROKE}
                strokeLinecap="round"
              />,
            );
          }

          return <g key={`walls-${r}-${c}`}>{wallLines}</g>;
        }),
      )}

      {/* ── Entry logo (CodeCamp) — drawn last so it renders above walls ── */}
      <g transform={`translate(${entryLogoX}, ${entryLogoY})`}>
        <CodeCampIcon size={`${LOGO_SIZE}px`} />
      </g>
    </g>
  );
};
