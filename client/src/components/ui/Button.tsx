import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className}`}
      {...props}
    >
      {props.children}
    </button>
  );
};
