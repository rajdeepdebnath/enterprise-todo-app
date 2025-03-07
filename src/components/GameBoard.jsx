import React from 'react';
import './GameBoard.css';

function GameBoard({ snake, food, powerUp, hasPowerUp, boardSize }) {
  // Create a 2D grid representation
  const renderBoard = () => {
    const cells = [];
    
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        // Determine cell type
        let cellType = 'empty';
        
        // Check if cell is part of snake
        const isSnakeCell = snake.some(segment => segment.x === x && segment.y === y);
        
        if (isSnakeCell) {
          // Check if it's the head
          if (snake[0].x === x && snake[0].y === y) {
            cellType = 'snake-head';
          } else {
            cellType = 'snake-body';
          }
        }
        
        // Check if cell is food
        if (food.x === x && food.y === y) {
          cellType = 'food';
        }
        
        // Check if cell is power-up
        if (powerUp && powerUp.x === x && powerUp.y === y) {
          cellType = 'power-up';
        }
        
        cells.push(
          <div 
            key={`${x}-${y}`} 
            className={`cell ${cellType}`}
            style={{
              gridColumn: x + 1,
              gridRow: y + 1
            }}
          />
        );
      }
    }
    
    return cells;
  };

  return (
    <div 
      className="game-board"
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`
      }}
    >
      {renderBoard()}
    </div>
  );
}

export default GameBoard;
