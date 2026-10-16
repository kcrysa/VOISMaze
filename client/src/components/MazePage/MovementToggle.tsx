import React from 'react';

interface MovementToggleProps {
  mode: 'drag' | 'click';
  onChange: (mode: 'drag' | 'click') => void;
}

export const MovementToggle: React.FC<MovementToggleProps> = ({ mode, onChange }) => {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--color-surface)',
      borderRadius: '20px',
      padding: '4px',
      gap: '4px',
      border: '1px solid var(--color-wall)'
    }}>
      {(['drag', 'click'] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            background: mode === m ? 'var(--color-primary)' : 'transparent',
            color: mode === m ? 'white' : 'var(--color-muted)',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transition: 'var(--transition-fast)'
          }}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
};
