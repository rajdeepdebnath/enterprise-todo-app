import { useState, useEffect, useRef } from 'react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import './Game.css';

// Constants
const BOARD_SIZE = 20;
const INITIAL_SPEED = 200; // Slower initial speed
const SPEED_INCREMENT = 15;
const MAX_SPEED = 50;
const POINTS_PER_LEVEL = 5; // Points needed to level up
const POWER_UP_CHANCE = 0.1; // 10% chance of power-up appearing when food is eaten
const POWER_UP_DURATION = 5000; // 5 seconds

// Direction constants
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// Initial snake position
const initialSnake = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 }
];

function Game() {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [powerUp, setPowerUp] = useState(null);
  const [hasPowerUp, setHasPowerUp] = useState(false);
  const [direction, setDirection] = useState(DIRECTIONS.UP);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  
  // Use refs to avoid closure issues with event listeners
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const hasPowerUpRef = useRef(hasPowerUp);

  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
    snakeRef.current = snake;
    gameOverRef.current = gameOver;
    isPausedRef.current = isPaused;
    hasPowerUpRef.current = hasPowerUp;
  }, [direction, snake, gameOver, isPaused, hasPowerUp]);

  // Generate random position (for food and power-ups)
  const generateRandomPosition = () => {
    const newPosition = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
    
    // Make sure it doesn't appear on snake
    const isOnSnake = snake.some(segment => 
      segment.x === newPosition.x && segment.y === newPosition.y
    );
    
    // Also make sure it doesn't overlap with other items
    const isOnFood = food && food.x === newPosition.x && food.y === newPosition.y;
    const isOnPowerUp = powerUp && powerUp.x === newPosition.x && powerUp.y === newPosition.y;
    
    if (isOnSnake || isOnFood || isOnPowerUp) {
      return generateRandomPosition();
    }
    
    return newPosition;
  };
  
  // Generate food position
  const generateFood = () => generateRandomPosition();
  
  // Generate power-up position
  const generatePowerUp = () => {
    // Only generate a power-up with a certain probability
    if (Math.random() < POWER_UP_CHANCE) {
      return generateRandomPosition();
    }
    return null;
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOverRef.current) return;
      
      // Pause/resume game with spacebar
      if (e.key === ' ' || e.code === 'Space') {
        setIsPaused(prev => !prev);
        return;
      }
      
      if (isPausedRef.current) return;
      
      // Prevent reversing direction
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== DIRECTIONS.DOWN) {
            setDirection(DIRECTIONS.UP);
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== DIRECTIONS.UP) {
            setDirection(DIRECTIONS.DOWN);
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== DIRECTIONS.RIGHT) {
            setDirection(DIRECTIONS.LEFT);
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== DIRECTIONS.LEFT) {
            setDirection(DIRECTIONS.RIGHT);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const moveSnake = () => {
      if (gameOverRef.current || isPausedRef.current) return;
      
      const head = { ...snakeRef.current[0] };
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y
      };
      
      // Check for collisions with walls
      if (
        newHead.x < 0 || 
        newHead.x >= BOARD_SIZE || 
        newHead.y < 0 || 
        newHead.y >= BOARD_SIZE
      ) {
        setGameOver(true);
        return;
      }
      
      // Check for collisions with self
      if (snakeRef.current.some(segment => 
        segment.x === newHead.x && segment.y === newHead.y
      )) {
        setGameOver(true);
        return;
      }
      
      const newSnake = [newHead, ...snakeRef.current];
      
      // Check if snake ate food
      if (newHead.x === food.x && newHead.y === food.y) {
        setFood(generateFood());
        
        // Maybe generate a power-up
        setPowerUp(generatePowerUp());
        
        // Update score and check for level up
        setScore(prevScore => {
          const newScore = prevScore + 1;
          
          // Update high score if needed
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          
          // Level up logic
          if (newScore > 0 && newScore % POINTS_PER_LEVEL === 0) {
            setLevel(prevLevel => prevLevel + 1);
            
            // Increase speed with each level, but not beyond max speed
            if (speed > MAX_SPEED) {
              setSpeed(prevSpeed => Math.max(prevSpeed - SPEED_INCREMENT, MAX_SPEED));
            }
          }
          
          return newScore;
        });
      } else if (powerUp && newHead.x === powerUp.x && newHead.y === powerUp.y) {
        // Snake ate a power-up
        setPowerUp(null);
        setHasPowerUp(true);
        
        // Set a timer to remove the power-up effect
        setTimeout(() => {
          setHasPowerUp(false);
        }, POWER_UP_DURATION);
        
        // Add bonus points for power-up
        setScore(prevScore => {
          const newScore = prevScore + 3;
          
          // Update high score if needed
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          
          return newScore;
        });
      } else {
        // Remove tail if no food or power-up was eaten
        newSnake.pop();
      }
      
      setSnake(newSnake);
    };
    
    const gameInterval = setInterval(moveSnake, speed);
    
    return () => {
      clearInterval(gameInterval);
    };
  }, [food, gameOver, isPaused, score, speed]);

  // Reset game
  const resetGame = () => {
    setSnake(initialSnake);
    setFood(generateFood());
    setPowerUp(null);
    setHasPowerUp(false);
    setDirection(DIRECTIONS.UP);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle direction change from UI controls
  const handleDirectionChange = (newDirection) => {
    if (gameOver || isPaused) return;
    
    // Prevent reversing direction
    if (
      (newDirection === DIRECTIONS.UP && direction !== DIRECTIONS.DOWN) ||
      (newDirection === DIRECTIONS.DOWN && direction !== DIRECTIONS.UP) ||
      (newDirection === DIRECTIONS.LEFT && direction !== DIRECTIONS.RIGHT) ||
      (newDirection === DIRECTIONS.RIGHT && direction !== DIRECTIONS.LEFT)
    ) {
      setDirection(newDirection);
    }
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="score-level">
          <div className="score">Score: {score}</div>
          <div className="level">Level: {level}</div>
        </div>
        <div className="high-score">High Score: {highScore}</div>
        {hasPowerUp && <div className="power-up-active">Power-Up Active!</div>}
        {gameOver && <div className="game-over">Game Over!</div>}
        {isPaused && !gameOver && <div className="paused">Paused</div>}
      </div>
      
      <GameBoard 
        snake={snake} 
        food={food}
        powerUp={powerUp}
        hasPowerUp={hasPowerUp}
        boardSize={BOARD_SIZE} 
      />
      
      <GameControls 
        onReset={resetGame}
        onPause={togglePause}
        isPaused={isPaused}
        gameOver={gameOver}
        onDirectionChange={handleDirectionChange}
        directions={DIRECTIONS}
      />
      
      <div className="instructions">
        <p>Use arrow keys to move the snake.</p>
        <p>Press space to pause/resume.</p>
      </div>
    </div>
  );
}

export default Game;
