const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cellSize = 20;
const rows = Math.floor(window.innerHeight / cellSize);
const cols = Math.floor(window.innerWidth / cellSize);
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
        this.visited = false;
    }

    getUnvisitedNeighbors() {
        const neighbors = [];

        const top = grid[this.row - 1] && grid[this.row - 1][this.col];
        const right = grid[this.row][this.col + 1];
        const bottom = grid[this.row + 1] && grid[this.row + 1][this.col];
        const left = grid[this.row][this.col - 1];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        return neighbors;
    }

    show() {
        const x = this.col * cellSize;
        const y = this.row * cellSize;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        if (this.walls.top) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
            ctx.stroke();
        }
        if (this.walls.right) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if (this.walls.bottom) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y + cellSize);
            ctx.lineTo(x, y + cellSize);
            ctx.stroke();
        }
        if (this.walls.left) {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        if (this.visited) {
            ctx.fillStyle = "#eee";
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

let grid = [];

function setupGrid() {
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            grid[i][j] = new Cell(i, j);
        }
    }
}

function removeWalls(a, b) {
    const x = a.col - b.col;
    if (x === 1) {
        a.walls.left = false;
        b.walls.right = false;
    } else if (x === -1) {
        a.walls.right = false;
        b.walls.left = false;
    }

    const y = a.row - b.row;
    if (y === 1) {
        a.walls.top = false;
        b.walls.bottom = false;
    } else if (y === -1) {
        a.walls.bottom = false;
        b.walls.top = false;
    }
}

function generateMaze() {
    setupGrid();

    const start = grid[0][0];
    const stack = [start];
    start.visited = true;

    while (stack.length) {
        const current = stack[stack.length - 1];
        const neighbors = current.getUnvisitedNeighbors();

        if (neighbors.length) {
            const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(neighbor);

            removeWalls(current, neighbor);

            neighbor.visited = true;
        } else {
            stack.pop();
        }
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j].show();
        }
    }
}

generateMaze();

let playerPosition = { row: 0, col: 0 };
const endPosition = { row: rows - 1, col: cols - 1 };

function drawPlayer() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    const x = playerPosition.col * cellSize + cellSize / 2;
    const y = playerPosition.row * cellSize + cellSize / 2;
    ctx.arc(x, y, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawEnd() {
    ctx.fillStyle = 'green';
    ctx.fillRect(endPosition.col * cellSize, endPosition.row * cellSize, cellSize, cellSize);
}

function canMoveTo(row, col) {
    const cell = grid[row][col];
    if (!cell) return false;

    if (playerPosition.row < row && cell.walls.top) return false;
    if (playerPosition.row > row && cell.walls.bottom) return false;
    if (playerPosition.col < col && cell.walls.left) return false;
    if (playerPosition.col > col && cell.walls.right) return false;

    return true;
}

canvas.addEventListener('keydown', function(event) {
    let newRow = playerPosition.row;
    let newCol = playerPosition.col;
    switch(event.key) {
        case 'ArrowUp':
            newRow--;
            break;
        case 'ArrowRight':
            newCol++;
            break;
        case 'ArrowDown':
            newRow++;
            break;
        case 'ArrowLeft':
            newCol--;
            break;
    }
    if (canMoveTo(newRow, newCol)) {
        playerPosition.row = newRow;
        playerPosition.col = newCol;
        renderGame();
        if (playerPosition.row === endPosition.row && playerPosition.col === endPosition.col) {
            alert('You Win!');
        }
    }
});

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j].show();
        }
    }
    drawEnd();
    drawPlayer();
}

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateMaze();
    renderGame();
});

canvas.tabIndex = 1000;  // Make the canvas focusable
canvas.focus();         // Give focus to the canvas for key events
renderGame();
