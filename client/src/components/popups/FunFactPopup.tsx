import React from "react";
import { Button } from "../ui/Button";
import styles from "./Popup.module.css";

interface FunFactPopupProps {
  funFact: string;
  onConfirmExit: () => void;
}

export const FunFactPopup: React.FC<FunFactPopupProps> = ({
  funFact,
  onConfirmExit,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <h2 className={styles.title}>Did you know?</h2>
        <div className={styles.stats}>
          <p>
            <span className={styles.statValue}>
              {funFact}
            </span>
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={onConfirmExit}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
