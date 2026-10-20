import React from "react";
import { PulseStyle } from "../../theme/PulseStyle";
import type { PlayerIcon } from "../StartPage/StartPage";
import { CatIcon } from "../icons/CatIcon";
import { DogIcon } from "../icons/DogIcon";

interface PlayerTokenProps {
  row: number;
  col: number;
  cellSize: number;
  gridPadding: number;
  movementMode?: "drag" | "click";
  icon: PlayerIcon;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  row,
  col,
  cellSize,
  gridPadding,
  movementMode = "drag",
  icon,
}) => {
  const cx = gridPadding + col * cellSize + cellSize / 2;
  const cy = gridPadding + row * cellSize + cellSize / 2;

  return (
    <g
      transform={`translate(${cx - 40}, ${cy - 40})`}
      style={{
        pointerEvents: "none",
        transition: "transform 85ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <PulseStyle />
      {movementMode === "drag" && (
        <circle
          cx={40}
          cy={40}
          r={40}
          fill="var(--color-glow-white)"
          className="token-glow"
        />
      )}
      <g>
        {icon === "cat" ? <CatIcon /> : <DogIcon />}
      </g>
    </g>
  );
};
