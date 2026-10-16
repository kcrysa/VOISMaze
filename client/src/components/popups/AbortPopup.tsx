import React from "react";
import { Button } from "../ui/Button";
import { formatTime } from "../../utils/mazeHelpers";
import styles from "./Popup.module.css";

interface AbortPopupProps {
  elapsedSeconds: number;
  onKeepGoing: () => void;
  onConfirmExit: () => void;
}

export const AbortPopup: React.FC<AbortPopupProps> = ({
  elapsedSeconds,
  onKeepGoing,
  onConfirmExit,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <h2 className={styles.title}>Giving up already?</h2>
        <div className={styles.stats}>
          <p>
            Time elapsed:{" "}
            <span className={styles.statValue}>
              {formatTime(elapsedSeconds)}
            </span>
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onKeepGoing}>
            Keep Going
          </Button>
          <Button variant="primary" onClick={onConfirmExit}>
            Exit Challenge
          </Button>
        </div>
      </div>
    </div>
  );
};
