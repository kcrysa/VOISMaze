import React from "react";
import { CatIcon } from "../icons/CatIcon";
import { DogIcon } from "../icons/DogIcon";
import type { PlayerIcon } from "../StartPage/StartPage";
import { Button } from "../ui/Button";
import styles from "./Popup.module.css";

interface FunFactPopupProps {
  funFact: string;
  icon: PlayerIcon;
  onConfirmExit: () => void;
}

export const FunFactPopup: React.FC<FunFactPopupProps> = ({
  funFact,
  icon,
  onConfirmExit,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${styles.smoothPopup}`}>
        <div className={styles.funFactIconContainer}>
          {icon === "cat" ? <CatIcon size="75px" /> : <DogIcon size="75px" />}
        </div>
        <h2 className={styles.title}>Did you know?</h2>
        <div className={styles.funFactContainer}>
          <p className={styles.funFactText}>{funFact}</p>
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
