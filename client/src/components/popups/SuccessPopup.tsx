import React, { useEffect, useRef } from "react";
import { formatTime } from "../../utils/mazeHelpers";
import type { PlayerIcon } from "../StartPage/StartPage";
import { CatIcon } from "../icons/CatIcon";
import { DogIcon } from "../icons/DogIcon";
import { Button } from "../ui/Button";
import styles from "./Popup.module.css";

interface SuccessPopupProps {
  elapsedSeconds: number;
  wrongTurns: number;
  onClose: () => void;
  icon: PlayerIcon;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  elapsedSeconds,
  // wrongTurns,
  onClose,
  icon,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef(null);

  // Confetti Particle System for Winning screen
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Fit canvas to its relative parent container
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement!.offsetWidth;
      canvas.height = canvas.parentElement!.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const colors = ["#E60000", "#9C2AA0", "#00d2ff", "#00ff87", "#ffcc00"];
    const particles = Array.from({ length: 65 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height - 20,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
    }));

    // Animation Loop
    const animate = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.rotation += p.rotationSpeed;

          // Bounce horizontally off walls
          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;

          // Recycle particle when it goes off screen bottom
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
            p.speedY = Math.random() * 3 + 2;
          }

          // Draw particle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${styles.slideUp}`}>
        <canvas ref={canvasRef} className={styles.confettiCanvas} />
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "20%",
            width: "250px",
            height: "250px",
            background:
              "radial-gradient(circle, rgba(0, 255, 135, 0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className={styles.animationContainer}>
          <div className={styles.successHalo}>
            {icon === "cat" ? (
              <CatIcon size="100px" />
            ) : (
              <DogIcon size="100px" />
            )}
          </div>
        </div>

        <h2 className={styles.title}>You Made It!</h2>
        <div className={styles.stats}>
          <p>
            Time:{" "}
            <span className={styles.statValue}>
              {formatTime(elapsedSeconds)}
            </span>
          </p>
        </div>
        <Button onClick={onClose}>Back to Start</Button>
      </div>
    </div>
  );
};
