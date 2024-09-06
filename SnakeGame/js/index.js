let inputDir = { x: 0, y: 0 };
const foodSound = new Audio("music/food.mp3");
const gameOverSound = new Audio("music/gameover.mp3");
const moveSound = new Audio("music/move.mp3");
let speed = 10;
let score = 0;
let lastPaintTime = 0;
let snakeArr = [{ x: 13, y: 15 }];
let food = { x: 6, y: 7 };
let hiscoreval = 0;

function main(ctime) {
  window.requestAnimationFrame(main);
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
    return;
  }
  lastPaintTime = ctime;
  gameEngine();
}

function isCollide(snake) {
  return checkSelfCollision(snake) || checkWallCollision(snake[0]);
}

function checkSelfCollision(snake) {
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }
  return false;
}

function checkWallCollision(head) {
  return head.x >= 18 || head.x <= 0 || head.y >= 18 || head.y <= 0;
}

function updateGame() {
  if (isCollide(snakeArr)) {
    handleGameOver();
    return;
  }
  if (checkFoodCollision()) {
    foodSound.play();
    incrementScore();
    generateNewFood();
    growSnake();
    adjustSpeed();
  }
  moveSnake();
}

function handleGameOver() {
  gameOverSound.play();
  inputDir = { x: 0, y: 0 };
  alert("Game Over. Press any key to play again!");
  resetGame();
}

function resetGame() {
  snakeArr = [{ x: 13, y: 15 }];
  score = 0;
  speed = 10;
  updateScoreBoard();
}

function checkFoodCollision() {
  return snakeArr[0].x === food.x && snakeArr[0].y === food.y;
}

function incrementScore() {
  score += 1;
  if (score > hiscoreval) {
    hiscoreval = score;
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
    hiscoreBox.innerHTML = "High-Score: " + hiscoreval;
  }
  updateScoreBoard();
}

function updateScoreBoard() {
  scoreBox.innerHTML = "Your-Score: " + score;
}

function generateNewFood() {
  let a = 2,
    b = 16;
  food = {
    x: Math.round(a + (b - a) * Math.random()),
    y: Math.round(a + (b - a) * Math.random()),
  };
}

function growSnake() {
  snakeArr.unshift({
    x: snakeArr[0].x + inputDir.x,
    y: snakeArr[0].y + inputDir.y,
  });
}

function moveSnake() {
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }
  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;
}

function adjustSpeed() {
  speed = 10 + Math.floor(score / 5);
}

function renderGame() {
  renderSnake();
  renderFood();
}

function renderSnake() {
  board.innerHTML = "";
  snakeArr.forEach((e, index) => {
    const snakeElement = document.createElement("div");
    snakeElement.style.gridRowStart = e.y;
    snakeElement.style.gridColumnStart = e.x;
    snakeElement.classList.add(index === 0 ? "head" : "snake");
    board.appendChild(snakeElement);
  });
}

function renderFood() {
  const foodElement = document.createElement("div");
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add("food");
  board.appendChild(foodElement);
}

function gameEngine() {
  updateGame();
  renderGame();
}

window.addEventListener("DOMContentLoaded", () => {
  const hiscore = localStorage.getItem("hiscore");
  hiscoreval = hiscore === null ? 0 : JSON.parse(hiscore);
  hiscoreBox.innerHTML = "High-Score: " + hiscoreval;
  window.requestAnimationFrame(main);
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("touchstart", handleTouchStart, false);
  window.addEventListener("touchmove", handleTouchMove, false);
});

function handleKeydown(e) {
  inputDir = { x: 0, y: 1 };
  moveSound.play();
  switch (e.key) {
    case "ArrowUp":
      inputDir = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      inputDir = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      inputDir = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      inputDir = { x: 1, y: 0 };
      break;
  }
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) return;
  let xUp = evt.touches[0].clientX;
  let yUp = evt.touches[0].clientY;
  let xDiff = xDown - xUp;
  let yDiff = yDown - yUp;
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    inputDir = xDiff > 0 ? { x: -1, y: 0 } : { x: 1, y: 0 };
  } else {
    inputDir = yDiff > 0 ? { x: 0, y: -1 } : { x: 0, y: 1 };
  }
  xDown = null;
  yDown = null;
}
