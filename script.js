const rows = 8;
const cols = 15;
let start = { x: 0, y: 0 };
let end = { x: 7, y: 14 };
let baseMaze = [];

function initializeMaze() {
  // Step 1: Create a fully walled maze (all cells as obstacles initially)
  baseMaze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isObstacle: true,  // Initially, mark all cells as obstacles
      visited: false,
    }))
  );

  // Step 2: Generate maze paths using randomized DFS
  randomizedDFS(start);

  // Step 3: Ensure start and end are not obstacles
  baseMaze[start.x][start.y].isObstacle = false;
  baseMaze[end.x][end.y].isObstacle = false;

  // Clone the maze for each algorithm
  for (let algorithm of ["bfs", "dfs", "astar", "dijkstra"]) {
    resetMaze(algorithm);
    renderMaze(algorithm);
  }
}

function randomizedDFS(current) {
  let stack = [current];
  baseMaze[current.x][current.y].isObstacle = false; // Start point as path

  while (stack.length > 0) {
    let { x, y } = stack[stack.length - 1];
    baseMaze[x][y].visited = true;

    // Get all unvisited neighbors
    let neighbors = [];
    for (let [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx * 2, ny = y + dy * 2;  // Skip every other cell for thicker walls
      if (isInBounds(nx, ny) && !baseMaze[nx][ny].visited) {
        neighbors.push({ x: nx, y: ny, throughX: x + dx, throughY: y + dy });
      }
    }

    if (neighbors.length > 0) {
      // Choose a random neighbor
      let next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Remove the wall between the current cell and chosen neighbor
      baseMaze[next.throughX][next.throughY].isObstacle = false;
      baseMaze[next.x][next.y].isObstacle = false;

      // Move to the chosen neighbor
      stack.push({ x: next.x, y: next.y });
    } else {
      // Backtrack if no unvisited neighbors
      stack.pop();
    }
  }
}


// Clone the baseMaze for each algorithm to ensure identical layout
function resetMaze(algorithm) {
  window[`${algorithm}Maze`] = baseMaze.map(row =>
    row.map(cell => ({ ...cell, visited: false }))
  );
}

// Render the maze for each algorithm's grid
function renderMaze(algorithm) {
    const mazeContainer = document.getElementById(`maze-${algorithm}`);
    mazeContainer.innerHTML = "";
    
    // Dynamically adjust the number of columns based on cols value
    mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
    
    window[`${algorithm}Maze`].forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");
        if (i === start.x && j === start.y) cellDiv.classList.add("start");
        else if (i === end.x && j === end.y) cellDiv.classList.add("end");
        else if (cell.isObstacle) cellDiv.classList.add("obstacle");
        else cellDiv.classList.add("path");
        cellDiv.id = `cell-${algorithm}-${i}-${j}`;
        mazeContainer.appendChild(cellDiv);
      });
    });
  }
  

// Start all algorithms at the same time
function startTraversal() {
  startBFS();
  startDFS();
  startAStar();
  startDijkstra();
}

// New function to animate the endpoint when reached
function animateEndpoint(mazeType) {
  const endCell = document.getElementById(`cell-${mazeType}-${end.x}-${end.y}`);
  if (endCell) {
    endCell.classList.add("endpoint-reached"); // Apply a special class for endpoint animation
  }
}

// BFS Algorithm
async function startBFS() {
  let queue = [start];
  let maze = window.bfsMaze;
  maze[start.x][start.y].visited = true;
  while (queue.length > 0) {
    let { x, y } = queue.shift();
    if (x === end.x && y === end.y) {
      animateEndpoint("bfs");
      return;
    }
    await animateCell(x, y, "visited", "bfs");
    for (let [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      if (isInBounds(nx, ny) && !maze[nx][ny].visited && !maze[nx][ny].isObstacle) {
        maze[nx][ny].visited = true;
        queue.push({ x: nx, y: ny });
      }
    }
  }
}

// Update DFS, A*, and Dijkstra similarly to call animateEndpoint on reaching the endpoint
async function startDFS() {
  let stack = [start];
  let maze = window.dfsMaze;
  maze[start.x][start.y].visited = true;
  while (stack.length > 0) {
    let { x, y } = stack.pop();
    if (x === end.x && y === end.y) {
      animateEndpoint("dfs");
      return;
    }
    await animateCell(x, y, "visited", "dfs");
    for (let [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      if (isInBounds(nx, ny) && !maze[nx][ny].visited && !maze[nx][ny].isObstacle) {
        maze[nx][ny].visited = true;
        stack.push({ x: nx, y: ny });
      }
    }
  }
}

// Similarly add animateEndpoint in startAStar and startDijkstra
// Add this code to A* and Dijkstra functions as well:
async function startAStar() {
  let openSet = [start];
  let maze = window.astarMaze;
  maze[start.x][start.y].visited = true;
  while (openSet.length > 0) {
    openSet.sort((a, b) => heuristic(a) - heuristic(b));
    let { x, y } = openSet.shift();
    if (x === end.x && y === end.y) {
      animateEndpoint("astar");
      return;
    }
    await animateCell(x, y, "visited", "astar");
    for (let [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      if (isInBounds(nx, ny) && !maze[nx][ny].visited && !maze[nx][ny].isObstacle) {
        maze[nx][ny].visited = true;
        openSet.push({ x: nx, y: ny });
      }
    }
  }
}

async function startDijkstra() {
  let queue = [start];
  let maze = window.dijkstraMaze;
  maze[start.x][start.y].visited = true;
  while (queue.length > 0) {
    queue.sort((a, b) => distance(a) - distance(b));
    let { x, y } = queue.shift();
    if (x === end.x && y === end.y) {
      animateEndpoint("dijkstra");
      return;
    }
    await animateCell(x, y, "visited", "dijkstra");
    for (let [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      if (isInBounds(nx, ny) && !maze[nx][ny].visited && !maze[nx][ny].isObstacle) {
        maze[nx][ny].visited = true;
        queue.push({ x: nx, y: ny });
      }
    }
  }
}


// Utility Functions
function heuristic(node) { return Math.abs(node.x - end.x) + Math.abs(node.y - end.y); }
function distance(node) { return Math.abs(node.x - start.x) + Math.abs(node.y - start.y); }
function isInBounds(x, y) { return x >= 0 && x < rows && y >= 0 && y < cols; }
async function animateCell(x, y, className, mazeType) {
  const cell = document.getElementById(`cell-${mazeType}-${x}-${y}`);
  if (cell) {
    cell.classList.add(className);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// Initialize mazes on load
initializeMaze();
