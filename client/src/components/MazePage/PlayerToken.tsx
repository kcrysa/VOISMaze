import React, { useRef } from "react";
import { PulseStyle } from "../../theme/PulseStyle";
import type { PlayerIcon } from "../StartPage/StartPage";
import { CatIcon } from "../icons/CatIcon";
import { DogIcon } from "../icons/DogIcon";

interface PlayerTokenProps {
  row: number;
  col: number;
  cellSize: number;
  gridPadding: number;
  onDragEnd: (deltaX: number, deltaY: number) => void;
  movementMode: "drag" | "click";
  icon: PlayerIcon;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  row,
  col,
  cellSize,
  gridPadding,
  onDragEnd,
  movementMode,
  icon,
}) => {
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (movementMode !== "drag") return;
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDragging.current || movementMode !== "drag") return;
    isDragging.current = false;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    (e.currentTarget as SVGGElement).releasePointerCapture(e.pointerId);
    onDragEnd(deltaX, deltaY);
  };

  const cx = gridPadding + col * cellSize + cellSize / 2;
  const cy = gridPadding + row * cellSize + cellSize / 2;

  return (
    <g
      transform={`translate(${cx - 40}, ${cy - 40})`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        cursor: movementMode === "drag" ? "grab" : "default",
        touchAction: "none",
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
          style={{ pointerEvents: "none" }}
        />
      )}
      <g style={{ pointerEvents: "none" }}>
        {icon === "cat" ? <CatIcon /> : <DogIcon />}
      </g>
    </g>
  );
};
