import React from 'react';
import '../styles/Button.scss';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
  className = '',
}) => {
  const baseClass = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
