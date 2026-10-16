import React from "react";

export const PulseStyle: React.FC = () => (
  <defs>
    <style>{`
      @keyframes tokenPulse {
        0%, 100% { opacity: 0.15; r: 40; }
        50%       { opacity: 0.4;  r: 46; }
      }
      .token-glow { animation: tokenPulse 2s ease-in-out infinite; }
    `}</style>
  </defs>
);
