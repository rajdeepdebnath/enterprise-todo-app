import React from 'react';
import './GameControls.css';

function GameControls({ 
  onReset, 
  onPause, 
  isPaused, 
  gameOver,
  onDirectionChange,
  directions
}) {
  return (
    <div className="game-controls">
      <div className="button-controls">
        <button onClick={onReset}>
          {gameOver ? 'New Game' : 'Reset'}
        </button>
        
        {!gameOver && (
          <button onClick={onPause}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>
      
      <div className="direction-controls">
        <button 
          className="direction-btn up"
          onClick={() => onDirectionChange(directions.UP)}
          aria-label="Move Up"
        >
          ↑
        </button>
        <div className="horizontal-controls">
          <button 
            className="direction-btn left"
            onClick={() => onDirectionChange(directions.LEFT)}
            aria-label="Move Left"
          >
            ←
          </button>
          <button 
            className="direction-btn right"
            onClick={() => onDirectionChange(directions.RIGHT)}
            aria-label="Move Right"
          >
            →
          </button>
        </div>
        <button 
          className="direction-btn down"
          onClick={() => onDirectionChange(directions.DOWN)}
          aria-label="Move Down"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

export default GameControls;
