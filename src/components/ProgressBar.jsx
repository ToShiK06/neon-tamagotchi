import React from 'react';
import './ProgressBar.css';

function ProgressBar({ value = 100, max = 100, color = 'cyan', label, icon, showText = false }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="progress-wrap">
      {(label || icon) && (
        <div className="progress-label">
          {icon && <span className="progress-icon">{icon}</span>}
          {label && <span className="progress-label-text">{label}</span>}
          {showText && <span className="progress-value">{Math.round(value)}</span>}
        </div>
      )}
      <div className="progress-track">
        <div className={`progress-fill progress-fill-${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;