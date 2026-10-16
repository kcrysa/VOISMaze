import React, { useState } from "react";
import { CatIcon } from "../icons/CatIcon";
import { DogIcon } from "../icons/DogIcon";
import { Button } from "../ui/Button";
import { BackgroundPattern } from "./BackgroundPattern";
import styles from "./StartPage.module.css";

export type PlayerIcon = "cat" | "dog";
export interface IIcon {
  size?: string;
}

interface StartPageProps {
  onExplore: (icon: PlayerIcon) => void;
  isConnecting?: boolean;
}

export const StartPage: React.FC<StartPageProps> = ({
  onExplore,
  isConnecting = false,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<PlayerIcon>("cat");

  return (
    <div className={styles.container}>
      <BackgroundPattern />

      <div className={styles.content}>
        <h1 className={styles.title}>VOIS Maze Challenge</h1>
        <p className={styles.subtitle}>Navigate the maze. Find the center.</p>

        {/* ── Icon picker ── */}
        <span className={styles.iconPickerLabel}>Choose your explorer</span>
        <div className={styles.iconPicker}>
          {(["cat", "dog"] as PlayerIcon[]).map((icon) => (
            <button
              key={icon}
              className={`${styles.iconOption} ${selectedIcon === icon ? styles.iconOptionSelected : ""}`}
              onClick={() => setSelectedIcon(icon)}
              type="button"
            >
              {icon === "cat" ? <CatIcon /> : <DogIcon />}
            </button>
          ))}
        </div>

        <div className={styles.actionArea}>
          <Button
            onClick={() => onExplore(selectedIcon)}
            disabled={isConnecting}
          >
            Explore
          </Button>
          {isConnecting && (
            <div className={styles.connecting}>
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
              <span className={styles.connectingText}>Connecting...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
