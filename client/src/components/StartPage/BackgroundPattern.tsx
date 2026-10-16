import React from "react";
import styles from "./StartPage.module.css";

export const BackgroundPattern: React.FC = ({}) => {
  return (
    <div className={styles.background}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="bgPatternGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#e60000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9c2aa0" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M10,10 L90,10 M10,30 L70,30 M90,30 L90,90 M30,50 L90,50 M10,70 L70,70 M30,90 L90,90 M10,10 L10,90"
          stroke="url(#bgPatternGrad)"
          strokeWidth="0.6"
          fill="none"
        />
      </svg>
    </div>
  );
};
