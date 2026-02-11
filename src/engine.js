export const GRID_SIZE = 20;
const TICK_RATE = 150;

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

let snake = [];
let direction = { x: 1, y: 0 };
let food = null;
let score = 0;
let gameOver = false;
let running = false;
let intervalId = null;

function placeFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((seg) => seg.x === position.x && seg.y === position.y));
  return position;
}

function checkCollision(position) {
  if (
    position.x < 0 ||
    position.x >= GRID_SIZE ||
    position.y < 0 ||
    position.y >= GRID_SIZE
  ) {
    return true;
  }

  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x === position.x && snake[i].y === position.y) {
      return true;
    }
  }

  return false;
}

function emit(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

function emitState() {
  emit("snake:tick", { snake: [...snake], food: { ...food }, gameOver });
}

function update() {
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  if (checkCollision(newHead)) {
    gameOver = true;
    running = false;
    clearInterval(intervalId);
    emit("snake:die", { score });
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    food = placeFood();
    emit("snake:eat", { score });
  } else {
    snake.pop();
  }
}

function tick() {
  update();
  emitState();
}

function reset() {
  snake = INITIAL_SNAKE.map((seg) => ({ ...seg }));
  direction = { x: 1, y: 0 };
  food = placeFood();
  score = 0;
  gameOver = false;
  running = false;
  clearInterval(intervalId);
}

export function setDirection(newDirection) {
  if (newDirection.x !== 0 && direction.x !== 0) return;
  if (newDirection.y !== 0 && direction.y !== 0) return;
  direction = newDirection;
}

export function start() {
  reset();
  running = true;
  emit("snake:start");
  emitState();
  intervalId = setInterval(tick, TICK_RATE);
}

export function togglePause() {
  if (gameOver || !running) return;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    emit("snake:pause");
  } else {
    intervalId = setInterval(tick, TICK_RATE);
    emit("snake:resume");
  }
}

export function isRunning() {
  return running && !gameOver;
}
