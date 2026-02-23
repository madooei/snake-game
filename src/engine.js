export const GRID_SIZE = 20;
const TICK_RATE = 150;

let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

let direction = { x: 1, y: 0 };
let food = null;
let poison = null;
let score = 0;
let gameOver = false;
let intervalId = null;

// Placement functions are defined below via hoisting;
// we call them here so both food and poison exist before either
// placement function checks for the other.
food = placeFood();
poison = placePoison();

function placeFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((seg) => seg.x === position.x && seg.y === position.y) ||
    (poison && position.x === poison.x && position.y === poison.y)
  );
  return position;
}

function placePoison() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((seg) => seg.x === position.x && seg.y === position.y) ||
    (food && position.x === food.x && position.y === food.y)
  );
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

function update() {
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  if (checkCollision(newHead)) {
    gameOver = true;
    clearInterval(intervalId);
    emit("snake:die", { score });
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    food = placeFood();
    emit("snake:eat", { score });
  } else if (newHead.x === poison.x && newHead.y === poison.y) {
    snake.pop();
    if (snake.length <= 1) {
      gameOver = true;
      clearInterval(intervalId);
      emit("snake:die", { score });
      return;
    }
    snake.pop();
    poison = placePoison();
    emit("snake:poison");
  } else {
    snake.pop();
  }
}

function tick() {
  update();
  emit("snake:tick", {
    snake: [...snake],
    food: { ...food },
    poison: { ...poison },
    gameOver,
  });
}

export function setDirection(newDirection) {
  // Prevent reversing
  if (newDirection.x !== 0 && direction.x !== 0) return;
  if (newDirection.y !== 0 && direction.y !== 0) return;
  direction = newDirection;
}

export function start() {
  // Emit an initial tick so the UI renders the starting state
  emit("snake:tick", {
    snake: [...snake],
    food: { ...food },
    poison: { ...poison },
    gameOver,
  });
  intervalId = setInterval(tick, TICK_RATE);
}
