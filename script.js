import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const boardElement = document.querySelector("#board");
const turnLabel = document.querySelector("#turnLabel");
const statusLabel = document.querySelector("#statusLabel");
const restartButton = document.querySelector("#restartButton");

const pieceSymbols = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
};

const pieceValues = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

let game = new Chess();
let selectedSquare = null;
let legalMoves = [];
let lastMove = null;
let computerThinking = false;

function buildBoard() {
  boardElement.innerHTML = "";

  for (let rank = 8; rank >= 1; rank -= 1) {
    for (let fileIndex = 0; fileIndex < 8; fileIndex += 1) {
      const file = String.fromCharCode(97 + fileIndex);
      const squareName = `${file}${rank}`;
      const square = document.createElement("button");
      square.className = `square ${(rank + fileIndex) % 2 === 0 ? "dark" : "light"}`;
      square.type = "button";
      square.dataset.square = squareName;
      square.setAttribute("aria-label", squareName);
      square.addEventListener("click", () => handleSquareClick(squareName));
      boardElement.appendChild(square);
    }
  }
}

function renderBoard() {
  const checkSquare = game.isCheck() ? findKingSquare(game.turn()) : null;

  document.querySelectorAll(".square").forEach((squareElement) => {
    const squareName = squareElement.dataset.square;
    const piece = game.get(squareName);
    const moveTarget = legalMoves.find((move) => move.to === squareName);

    squareElement.classList.toggle("selected", squareName === selectedSquare);
    squareElement.classList.toggle("legal", Boolean(moveTarget && !piece));
    squareElement.classList.toggle("capture", Boolean(moveTarget && piece));
    squareElement.classList.toggle(
      "last-move",
      Boolean(lastMove && (lastMove.from === squareName || lastMove.to === squareName)),
    );
    squareElement.classList.toggle("in-check", squareName === checkSquare);

    squareElement.innerHTML = "";
    if (piece) {
      const pieceElement = document.createElement("span");
      pieceElement.className = `piece ${piece.color === "w" ? "white" : "black"}`;
      pieceElement.textContent = pieceSymbols[`${piece.color}${piece.type}`];
      squareElement.appendChild(pieceElement);
    }
  });

  updateStatus();
}

function handleSquareClick(squareName) {
  if (computerThinking || game.isGameOver() || game.turn() !== "w") {
    return;
  }

  const targetMove = legalMoves.find((move) => move.to === squareName);
  if (selectedSquare && targetMove) {
    makePlayerMove(selectedSquare, squareName);
    return;
  }

  const piece = game.get(squareName);
  if (piece?.color === "w") {
    selectedSquare = squareName;
    legalMoves = game.moves({ square: squareName, verbose: true });
  } else {
    clearSelection();
  }

  renderBoard();
}

function makePlayerMove(from, to) {
  const move = game.move({ from, to, promotion: "q" });
  if (!move) {
    return;
  }

  lastMove = move;
  clearSelection();
  renderBoard();

  if (!game.isGameOver()) {
    computerThinking = true;
    updateStatus();
    window.setTimeout(makeComputerMove, 350);
  }
}

function makeComputerMove() {
  const move = chooseComputerMove();
  if (move) {
    lastMove = game.move(move);
  }

  computerThinking = false;
  clearSelection();
  renderBoard();
}

function chooseComputerMove() {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return null;
  }

  let bestMove = moves[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const move of moves) {
    game.move(move);
    const score = minimax(2, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true);
    game.undo();

    if (score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(depth, alpha, beta, isMaximizingWhite) {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition();
  }

  const moves = game.moves({ verbose: true });

  if (isMaximizingWhite) {
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const move of moves) {
      game.move(move);
      bestScore = Math.max(bestScore, minimax(depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
    return bestScore;
  }

  let bestScore = Number.POSITIVE_INFINITY;
  for (const move of moves) {
    game.move(move);
    bestScore = Math.min(bestScore, minimax(depth - 1, alpha, beta, true));
    game.undo();
    beta = Math.min(beta, bestScore);
    if (beta <= alpha) break;
  }
  return bestScore;
}

function evaluatePosition() {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? -100000 : 100000;
  }

  if (game.isDraw()) {
    return 0;
  }

  let score = 0;
  const board = game.board();

  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const value = pieceValues[piece.type];
      score += piece.color === "w" ? value : -value;
    }
  }

  score += game.moves().length * (game.turn() === "w" ? 2 : -2);
  return score;
}

function updateStatus() {
  if (game.isCheckmate()) {
    const winner = game.turn() === "w" ? "Computer wins" : "You win";
    turnLabel.textContent = "Checkmate";
    statusLabel.textContent = `${winner} by checkmate`;
    return;
  }

  if (game.isStalemate()) {
    turnLabel.textContent = "Draw";
    statusLabel.textContent = "Stalemate";
    return;
  }

  if (game.isDraw()) {
    turnLabel.textContent = "Draw";
    statusLabel.textContent = "Draw by chess rules";
    return;
  }

  if (computerThinking) {
    turnLabel.textContent = "Computer Thinking";
    statusLabel.textContent = game.isCheck() ? "Black to move while in check" : "Black is choosing a move";
    return;
  }

  if (game.isCheck()) {
    turnLabel.textContent = "Check";
    statusLabel.textContent = game.turn() === "w" ? "Your king is in check" : "Black king is in check";
    return;
  }

  turnLabel.textContent = game.turn() === "w" ? "Your Turn" : "Computer Turn";
  statusLabel.textContent = game.turn() === "w" ? "White to move" : "Black to move";
}

function findKingSquare(color) {
  for (let rank = 8; rank >= 1; rank -= 1) {
    for (let fileIndex = 0; fileIndex < 8; fileIndex += 1) {
      const squareName = `${String.fromCharCode(97 + fileIndex)}${rank}`;
      const piece = game.get(squareName);
      if (piece?.type === "k" && piece.color === color) {
        return squareName;
      }
    }
  }
  return null;
}

function clearSelection() {
  selectedSquare = null;
  legalMoves = [];
}

function restartGame() {
  game = new Chess();
  lastMove = null;
  computerThinking = false;
  clearSelection();
  renderBoard();
}

restartButton.addEventListener("click", restartGame);

buildBoard();
renderBoard();
