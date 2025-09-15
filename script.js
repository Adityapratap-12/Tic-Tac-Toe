const boardEl = document.getElementById('board');
const turnText = document.getElementById('turnText');
const messageEl = document.getElementById('message');
const xScoreEl = document.getElementById('xScore');
const oScoreEl = document.getElementById('oScore');
const drawsEl = document.getElementById('draws');

const twoPlayerBtn = document.getElementById('twoPlayerBtn');
const onePlayerBtn = document.getElementById('onePlayerBtn');
const restartBtn = document.getElementById('restartBtn');
const newGameBtn = document.getElementById('newGameBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const firstXCheckbox = document.getElementById('firstX');
const undoBtn = document.getElementById('undoBtn');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let isGameActive = true;
let scores = { X:0, O:0, draws:0 };
let vsCPU = false;
let moveHistory = [];
let undoUsed = false;

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Create grid UI
function createBoardUI() {
  boardEl.innerHTML = '';
  for (let i=0;i<9;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => onCellClick(i));
    boardEl.appendChild(cell);
  }
}
createBoardUI();

function onCellClick(i) {
  if (!isGameActive || board[i]) return;
  placeMove(i, currentPlayer);
  moveHistory.push(i);

  const winner = checkWinner();
  if (winner) return handleGameOver(winner);
  if (board.every(Boolean)) return handleGameOver('draw');

  if (vsCPU && currentPlayer === 'O') {
    setTimeout(() => {
      const cpuIndex = cpuChooseMove();
      if (cpuIndex !== null) {
        placeMove(cpuIndex, 'O');
        moveHistory.push(cpuIndex);
        const w = checkWinner();
        if (w) return handleGameOver(w);
        if (board.every(Boolean)) return handleGameOver('draw');
      }
    }, 300);
  }
}

function placeMove(i, player) {
  board[i] = player;
  const cell = boardEl.querySelector(`[data-index="${i}"]`);
  cell.classList.add(player.toLowerCase(), 'disabled');
  cell.textContent = player;
  currentPlayer = player === 'X' ? 'O' : 'X';
  turnText.textContent = currentPlayer;
}

function checkWinner() {
  for (const combo of winningCombos) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return null;
}

function handleGameOver(result) {
  isGameActive = false;
  if (result === 'draw') {
    messageEl.textContent = "It's a draw!";
    drawsEl.textContent = ++scores.draws;
  } else {
    messageEl.textContent = `${result.winner} wins!`;
    highlightWin(result.combo);
    if (result.winner === 'X') xScoreEl.textContent = ++scores.X;
    else oScoreEl.textContent = ++scores.O;
  }
}

function highlightWin(combo) {
  combo.forEach(i => {
    const cell = boardEl.querySelector(`[data-index="${i}"]`);
    cell.classList.add('win');
  });
}

function resetRound() {
  board = Array(9).fill(null);
  isGameActive = true;
  moveHistory = [];
  undoUsed = false;
  Array.from(boardEl.children).forEach(c => {
    c.className = 'cell';
    c.textContent = '';
  });
  messageEl.textContent = "New round!";
  currentPlayer = firstXCheckbox.checked ? 'X' : 'O';
  turnText.textContent = currentPlayer;
  if (vsCPU && currentPlayer === 'O') {
    setTimeout(() => {
      const cpuIndex = cpuChooseMove();
      if (cpuIndex !== null) {
        placeMove(cpuIndex, 'O');
        moveHistory.push(cpuIndex);
      }
    }, 300);
  }
}

function newGame() {
  scores = { X:0, O:0, draws:0 };
  xScoreEl.textContent = 0;
  oScoreEl.textContent = 0;
  drawsEl.textContent = 0;
  resetRound();
}

// CPU strategy
function cpuChooseMove() {
  const free = board.map((v,i)=>v?null:i).filter(v=>v!==null);
  // win
  for (let i of free) {
    const copy = board.slice(); copy[i]='O';
    if (checkWinnerFromBoard(copy)) return i;
  }
  // block
  for (let i of free) {
    const copy = board.slice(); copy[i]='X';
    if (checkWinnerFromBoard(copy)) return i;
  }
  if (board[4]===null) return 4;
  const corners = [0,2,6,8].filter(i=>board[i]===null);
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  return free.length ? free[Math.floor(Math.random()*free.length)] : null;
}

function checkWinnerFromBoard(b) {
  for (const combo of winningCombos) {
    const [a,b1,c] = combo;
    if (b[a] && b[a]===b[b1] && b[a]===b[c]) return {winner:b[a]};
  }
  return null;
}

// Undo
undoBtn.addEventListener('click', () => {
  if (!moveHistory.length || undoUsed) return;
  const last = moveHistory.pop();
  board[last] = null;
  const cell = boardEl.querySelector(`[data-index="${last}"]`);
  cell.className = 'cell'; cell.textContent='';
  if (vsCPU && moveHistory.length) {
    const last2 = moveHistory.pop();
    board[last2] = null;
    const cell2 = boardEl.querySelector(`[data-index="${last2}"]`);
    cell2.className = 'cell'; cell2.textContent='';
  }
  undoUsed = true;
  isGameActive = true;
  currentPlayer = 'X';
  turnText.textContent = currentPlayer;
  messageEl.textContent = 'Undo done.';
});

// Events
twoPlayerBtn.addEventListener('click', () => {
  vsCPU = false;
  twoPlayerBtn.classList.add('active');
  onePlayerBtn.classList.remove('active');
  resetRound();
});
onePlayerBtn.addEventListener('click', () => {
  vsCPU = true;
  onePlayerBtn.classList.add('active');
  twoPlayerBtn.classList.remove('active');
  resetRound();
});
restartBtn.addEventListener('click', () => resetRound());
newGameBtn.addEventListener('click', () => newGame());
resetScoreBtn.addEventListener('click', () => {
  scores = { X:0, O:0, draws:0 };
  xScoreEl.textContent = 0;
  oScoreEl.textContent = 0;
  drawsEl.textContent = 0;
});
resetRound();
