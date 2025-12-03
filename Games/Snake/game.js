const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 20;
const TILES = canvas.width / TILE;

let snake = [{ x: 10, y: 10 }];
let dir = { x: 1, y: 0 };
let apple = spawnApple();
let score = 0;
let level = 1;
let speed = 140;
let loop;

// Load snake image
const snakeImg = new Image();
snakeImg.src = "./images/snake.png";

function spawnApple() {
  return {
    x: Math.floor(Math.random() * TILES),
    y: Math.floor(Math.random() * TILES)
  };
}

function drawBoard() {
  ctx.fillStyle = "#0d1623";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // mosaic/grid
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let y = 0; y < TILES; y++)
    for (let x = 0; x < TILES; x++)
      if ((x + y) % 2 === 0)
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
}

function drawApple() {
  ctx.fillStyle = "#ff4d4d";
  ctx.beginPath();
  ctx.arc(
    apple.x * TILE + TILE / 2,
    apple.y * TILE + TILE / 2,
    TILE / 2.4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawSnake() {
  snake.forEach((seg, i) => {
    if (i === 0) {
      // head
      drawRotated(seg.x * TILE, seg.y * TILE, TILE, TILE, dir);
    } else {
      ctx.drawImage(snakeImg, seg.x * TILE, seg.y * TILE, TILE, TILE);
    }
  });
}

function drawRotated(x, y, w, h, d) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  const angle = d.x === 1 ? 0 : d.x === -1 ? Math.PI : d.y === 1 ? Math.PI / 2 : -Math.PI / 2;
  ctx.rotate(angle);
  ctx.drawImage(snakeImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function tick() {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.y < 0 || head.x >= TILES || head.y >= TILES)
    return gameOver();

  if (snake.some(s => s.x === head.x && s.y === head.y))
    return gameOver();

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score++;
    document.getElementById("score").textContent = score;

    if (score % 5 === 0) {
      level++;
      speed = Math.max(60, speed - 10);
      document.getElementById("level").textContent = level;
      restartLoop();
    }

    apple = spawnApple();
  } else {
    snake.pop();
  }

  drawAll();
}

function drawAll() {
  drawBoard();
  drawApple();
  drawSnake();
}

function gameOver() {
  clearInterval(loop);
  saveHigh();
  alert("Game Over! Score: " + score);
}

function restartLoop() {
  clearInterval(loop);
  loop = setInterval(tick, speed);
}

function startGame() {
  snake = [{ x: 10, y: 10 }];
  dir = { x: 1, y: 0 };
  apple = spawnApple();
  score = 0;
  level = 1;
  speed = 140;
  document.getElementById("score").textContent = 0;
  document.getElementById("level").textContent = 1;
  restartLoop();
}

function saveHigh() {
  const high = Number(localStorage.getItem("snakeHigh") || 0);
  if (score > high) localStorage.setItem("snakeHigh", score);
  document.getElementById("high").textContent = localStorage.getItem("snakeHigh") || 0;
}

saveHigh();

// controls
window.addEventListener("keydown", e => {
  const k = e.key;
  if (k === "ArrowUp" && dir.y !== 1) dir = { x: 0, y: -1 };
  if (k === "ArrowDown" && dir.y !== -1) dir = { x: 0, y: 1 };
  if (k === "ArrowLeft" && dir.x !== 1) dir = { x: -1, y: 0 };
  if (k === "ArrowRight" && dir.x !== -1) dir = { x: 1, y: 0 };
  if (k === " ") pauseGame();
});

// touch
let touchX = 0, touchY = 0;
canvas.addEventListener("touchstart", e => {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
});
canvas.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  else dir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
});

function pauseGame() {
  if (loop) {
    clearInterval(loop);
    loop = null;
  } else restartLoop();
}

// buttons
document.getElementById("startBtn").onclick = startGame;
document.getElementById("pauseBtn").onclick = pauseGame;
