import "./style.css";
import "./ui.js";
import { start, setDirection } from "./engine.js";

document.addEventListener("keydown", (e) => {
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  if (directions[e.key]) {
    setDirection(directions[e.key]);
  }
});

start();
