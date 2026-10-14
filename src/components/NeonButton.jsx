import React from 'react';
import './NeonButton.css';

function NeonButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon = null,
}) {
  return (
    <button
      className={`neon-btn neon-btn-${variant} neon-btn-${size} ${fullWidth ? 'neon-btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="neon-btn-icon">{icon}</span>}
      <span className="neon-btn-text">{children}</span>
    </button>
  );
}

export default NeonButton;