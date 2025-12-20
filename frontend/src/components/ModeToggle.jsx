import React, { useState } from 'react';
import './ModeToggle.css';

export default function ModeToggle({ userMode, onModeChange }) {
  return (
    <div className="mode-toggle">
      <button
        className={`toggle-btn ${userMode === 'visitor' ? 'active' : ''}`}
        onClick={() => onModeChange('visitor')}
        title="Visitor: Hunt for memories left by others"
      >
        🔍 Visitor
      </button>
      <button
        className={`toggle-btn ${userMode === 'creator' ? 'active' : ''}`}
        onClick={() => onModeChange('creator')}
        title="Creator: Store memories for others to discover"
      >
        💾 Creator
      </button>
    </div>
  );
}
