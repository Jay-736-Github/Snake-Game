class SnakeGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Game elements
    this.startScreen = document.getElementById("startScreen");
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.scoreElement = document.getElementById("score");
    this.levelElement = document.getElementById("level");
    this.hiscoreElement = document.getElementById("hiscore");
    this.roastElement = document.getElementById("roastMessage");
    this.finalScoreElement = document.getElementById("finalScore");
    this.finalLevelElement = document.getElementById("finalLevel");

    // Sound effects (based on your original code)
    this.foodSound = new Audio("music/food.mp3");
    this.gameOverSound = new Audio("music/gameover.mp3");
    this.moveSound = new Audio("music/move.mp3");

    // Game settings - FASTER SPEED as requested
    this.gridSize = 20;
    this.initialSpeed = 10; // Much faster initial speed (like your original)
    this.speed = this.initialSpeed;

    // Game state
    this.snake = [];
    this.food = {};
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0; // Starting from 0, will increase by 1
    this.level = 1;
    this.gameRunning = false;
    this.gameLoop = null;
    this.lastPaintTime = 0;

    // Touch controls
    this.touchStartX = 0;
    this.touchStartY = 0;

    // Roast messages
    this.roastMessages = [
      "😂 Hey man, this is what you can do only?",
      "🤣 Is this your best effort? Really?",
      "😆 My grandma plays better than this!",
      "😏 That's embarrassing... try harder!",
      "🙄 Are you even trying?",
      "😂 Epic fail! What was that?",
      "🤭 That was painful to watch!",
      "😅 Maybe Snake isn't your game?",
      "😆 I've seen toddlers do better!",
      "🤪 Your snake had commitment issues!",
      "😂 Did you forget how to play mid-game?",
      "🤡 That was a spectacular disaster!",
      "😹 Your snake had a death wish!",
      "🙃 Physics called, they want their laws back!",
      "😂 Snake.exe has stopped working!",
    ];

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.loadHighScore();
    this.resetGame();
  }

  setupCanvas() {
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      // Calculate grid dimensions
      this.cols = Math.floor(this.canvas.width / this.gridSize);
      this.rows = Math.floor(this.canvas.height / this.gridSize);
      // Center the grid
      this.offsetX = (this.canvas.width - this.cols * this.gridSize) / 2;
      this.offsetY = (this.canvas.height - this.rows * this.gridSize) / 2;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  setupEventListeners() {
    // Start button
    document.getElementById("startBtn").addEventListener("click", () => {
      this.startGame();
    });

    // Restart button
    document.getElementById("restartBtn").addEventListener("click", () => {
      this.startGame();
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (!this.gameRunning) return;

      // Play move sound on any arrow key press
      this.moveSound.play();

      switch (e.key) {
        case "ArrowUp":
          if (this.direction.y !== 1) {
            this.nextDirection = { x: 0, y: -1 };
          }
          break;
        case "ArrowDown":
          if (this.direction.y !== -1) {
            this.nextDirection = { x: 0, y: 1 };
          }
          break;
        case "ArrowLeft":
          if (this.direction.x !== 1) {
            this.nextDirection = { x: -1, y: 0 };
          }
          break;
        case "ArrowRight":
          if (this.direction.x !== -1) {
            this.nextDirection = { x: 1, y: 0 };
          }
          break;
      }
      e.preventDefault();
    });

    // Touch controls
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        if (!this.gameRunning) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const minSwipeDistance = 50;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && this.direction.x !== -1) {
              this.nextDirection = { x: 1, y: 0 };
              this.moveSound.play();
            } else if (deltaX < 0 && this.direction.x !== 1) {
              this.nextDirection = { x: -1, y: 0 };
              this.moveSound.play();
            }
          }
        } else {
          if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && this.direction.y !== -1) {
              this.nextDirection = { x: 0, y: 1 };
              this.moveSound.play();
            } else if (deltaY < 0 && this.direction.y !== 1) {
              this.nextDirection = { x: 0, y: -1 };
              this.moveSound.play();
            }
          }
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }

  startGame() {
    this.startScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");
    this.resetGame();
    this.gameRunning = true;
    this.runGame(0);
  }

  resetGame() {
    // Reset snake to center
    const centerX = Math.floor(this.cols / 2);
    const centerY = Math.floor(this.rows / 2);

    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];

    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0; // Start from 0
    this.level = 1;
    this.speed = this.initialSpeed; // Reset to initial fast speed
    this.lastPaintTime = 0;

    this.generateFood();
    this.updateUI();
  }

  runGame(currentTime) {
    if (!this.gameRunning) return;

    // Control game speed using requestAnimationFrame like your original
    window.requestAnimationFrame((time) => this.runGame(time));

    if ((currentTime - this.lastPaintTime) / 1000 < 1 / this.speed) {
      return;
    }

    this.lastPaintTime = currentTime;
    this.update();
    this.draw();
  }

  update() {
    // Update direction
    this.direction = { ...this.nextDirection };

    // Move snake
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= this.cols ||
      head.y < 0 ||
      head.y >= this.rows
    ) {
      this.gameOver();
      return;
    }

    // Check self collision
    for (let segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      // Play food sound
      this.foodSound.play();

      // Increase score by 1 (as requested)
      this.score += 1;

      // Speed increase logic: Every 10 points, speed increases by 0.5x
      if (this.score % 10 === 0) {
        this.speed = this.speed * 1.5; // 0.5x faster (1.5x the speed)
        this.level = Math.floor(this.score / 10) + 1;

        this.levelElement.classList.add("score-animate");
        setTimeout(
          () => this.levelElement.classList.remove("score-animate"),
          500
        );
      }

      this.generateFood();
      this.updateUI();

      // Animate score
      this.scoreElement.classList.add("score-animate");
      setTimeout(
        () => this.scoreElement.classList.remove("score-animate"),
        500
      );
    } else {
      this.snake.pop();
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines (subtle)
    this.ctx.strokeStyle = "rgba(0, 255, 127, 0.1)";
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.cols; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX + i * this.gridSize, this.offsetY);
      this.ctx.lineTo(
        this.offsetX + i * this.gridSize,
        this.offsetY + this.rows * this.gridSize
      );
      this.ctx.stroke();
    }

    for (let i = 0; i <= this.rows; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, this.offsetY + i * this.gridSize);
      this.ctx.lineTo(
        this.offsetX + this.cols * this.gridSize,
        this.offsetY + i * this.gridSize
      );
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.forEach((segment, index) => {
      const x = this.offsetX + segment.x * this.gridSize;
      const y = this.offsetY + segment.y * this.gridSize;

      if (index === 0) {
        // Snake head
        this.ctx.fillStyle = "#00ff7f";
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);

        // Add glow effect
        this.ctx.shadowColor = "#00ff7f";
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        this.ctx.shadowBlur = 0;

        // Add eyes
        this.ctx.fillStyle = "#000";
        const eyeSize = 3;
        this.ctx.fillRect(x + 6, y + 6, eyeSize, eyeSize);
        this.ctx.fillRect(x + this.gridSize - 9, y + 6, eyeSize, eyeSize);
      } else {
        // Snake body
        const opacity = Math.max(0.4, 1 - index * 0.05);
        this.ctx.fillStyle = `rgba(0, 191, 255, ${opacity})`;
        this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
      }
    });

    // Draw food
    const foodX = this.offsetX + this.food.x * this.gridSize;
    const foodY = this.offsetY + this.food.y * this.gridSize;

    this.ctx.fillStyle = "#ff4757";
    this.ctx.shadowColor = "#ff4757";
    this.ctx.shadowBlur = 20;
    this.ctx.fillRect(
      foodX + 3,
      foodY + 3,
      this.gridSize - 6,
      this.gridSize - 6
    );
    this.ctx.shadowBlur = 0;

    // Add sparkle effect
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(foodX + 5, foodY + 5, 3, 3);
  }

  generateFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
      };
    } while (
      this.snake.some(
        (segment) => segment.x === this.food.x && segment.y === this.food.y
      )
    );
  }

  gameOver() {
    this.gameRunning = false;

    // Play game over sound
    this.gameOverSound.play();

    // Update high score
    const highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;
    if (this.score > highScore) {
      localStorage.setItem("snakeHighScore", this.score);
      this.loadHighScore();
    }

    // Show death message
    const randomRoast =
      this.roastMessages[Math.floor(Math.random() * this.roastMessages.length)];
    this.roastElement.textContent = randomRoast;
    this.finalScoreElement.textContent = this.score;
    this.finalLevelElement.textContent = this.level;

    this.gameOverScreen.classList.remove("hidden");
  }

  updateUI() {
    this.scoreElement.textContent = this.score;
    this.levelElement.textContent = this.level;
  }

  loadHighScore() {
    const highScore = localStorage.getItem("snakeHighScore") || 0;
    this.hiscoreElement.textContent = highScore;
  }
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
  new SnakeGame();
});
