let gridHtml = "";
let visualizerFlag = false;
let patternFlag = false;
let startCoordinates = [13, 19];
let destCoordinates = [13, 49];
let ROWSIZE = 27;
let COLUMNSIZE = 67;

// const startCoordinates = [1, 1];
// const destCoordinates = [1, 3];
// const ROWSIZE = 13;
// const COLUMNSIZE = 5;


const SPEED = 0;
const WEIGHT = 15;
let clickedDraggableNodes = false;
const NO_OF_NODES = ROWSIZE * COLUMNSIZE;
let weightKeyPressed = false;
let selectedAlgorithm = "";
let selectedPattern = "";
let nodeOnDrag = "";
let grid = [];
const createNode = (row, col) => {
  return {
    row,
    col,
    isStart: row === startCoordinates[0] && col === startCoordinates[1],
    isFinish: row === destCoordinates[0] && col === destCoordinates[1],
    distance: Infinity,
    weight: 0,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

// grid formation and fill adjacent matrix with 1 for every edge
for (let rowNumber = 0; rowNumber < ROWSIZE; rowNumber++) {
  gridHtml += `<div class="grid-row" id='row-${rowNumber}'>`;
  grid.push([]);
  for (let colNumber = 0; colNumber < COLUMNSIZE; colNumber++) {
    gridHtml += `<div id='cell-${rowNumber}-${colNumber}' class='grid-cell' onmouseover='onHoverCell(this, ${rowNumber}, ${colNumber})' onmousedown='onClickCell(this, ${rowNumber}, ${colNumber})' ondrop='onDropNode(event)' ondragover= 'allowDropHandler(event)'><div class="grid-cell-animation-node"></div></div>`;
    grid[rowNumber].push(createNode(rowNumber, colNumber));
  }
  gridHtml += "</div>";
}


document.getElementById("grid").innerHTML = gridHtml;
document.getElementById("grid").addEventListener("dragstart", (e) => {
  if (!clickedDraggableNodes)
    e.preventDefault();
});
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const weightToggle = (e) => {
  if (weightKeyPressed) {
    e.textContent = "draw weight";
    weightKeyPressed = false;
  } else {
    e.textContent = "draw wall";
    weightKeyPressed = true;
  }
}
let clickedGrid = false;
let eraseGrid = false;
const gridTouchHandler = (e, isClicked) => {
  clickedGrid = isClicked;
};
const clearTheWall = (e, i, j) => {
  grid[i][j].isWall = false;
  e.className = "grid-cell visited";
}
const wallTheCell = (e, i, j) => {
  let cell = grid[i][j];
  if (cell.weight) {
    cell.isWall = true;
    eraseGrid = false;
    e.className = "grid-cell pulseAnimation wall";
    cell.weight = 0;
    e.removeChild(e.childNodes[1]);
    return;
  }
  if (eraseGrid) {
    cell.isWall = false;
    e.className = "grid-cell";
    return;
  }
  if (!cell.isWall && !cell.isStart && !cell.isFinish) {
    cell.isWall = true;
    e.className = "grid-cell pulseAnimation wall";
  }
};
const addWeightToCell = (e, i, j) => {
  if (eraseGrid) {
    if (e.childNodes[1])
      e.removeChild(e.childNodes[1]);
    grid[i][j].weight = 0;
    cellArray[i * COLUMNSIZE + j].className = "grid-cell";
    return;
  }
  if (!e.childNodes[1] && !grid[i][j].isStart && !grid[i][j].isFinish) {
    let img = document.createElement('img');
    img.className = "weight-node-image";
    img.src = "./assets/weight_symbol.png";
    e.appendChild(img);
    grid[i][j].weight = WEIGHT;
    cellArray[i * COLUMNSIZE + j].className = "grid-cell weight";
  }
}
const onHoverCell = (e, i, j) => {
  if (grid[i][j].isStart || grid[i][j].isFinish) return;
  if (clickedGrid && !patternFlag) {
    if (!weightKeyPressed) {
      wallTheCell(e, i, j);
    } else {
      addWeightToCell(e, i, j);
    }
  }
};

const onClickCell = (e, i, j) => {
  if (grid[i][j].isStart || grid[i][j].isFinish) { clickedDraggableNodes = true };
  if (grid[i][j].isWall || grid[i][j].weight) eraseGrid = true;
  else eraseGrid = false;
  if (patternFlag) return;
  if (weightKeyPressed) {
    addWeightToCell(e, i, j);
  } else {
    wallTheCell(e, i, j);
  }
}

const allowDropHandler = (event) => {
  event.preventDefault();
};

const onDropNode = (event) => {
  clickedGrid = false;
  event.preventDefault();
  if (nodeOnDrag == "startNode") {
    startNodeElement = event.target.parentElement;
    startNodeElement.appendChild(startSymbol);
    grid[startCoordinates[0]][startCoordinates[1]].isStart = false;
    startCoordinates[0] = +startNodeElement.id.split("-")[1];
    startCoordinates[1] = +startNodeElement.id.split("-")[2];
    grid[startCoordinates[0]][startCoordinates[1]].isWall = false;
    grid[startCoordinates[0]][startCoordinates[1]].isStart = true;
  } else if (nodeOnDrag == "destNode") {
    destNodeElement = event.target.parentElement;
    destNodeElement.appendChild(destSymbol);
    grid[destCoordinates[0]][destCoordinates[1]].isFinish = false;
    destCoordinates[0] = +destNodeElement.id.split("-")[1];
    destCoordinates[1] = +destNodeElement.id.split("-")[2];
    grid[destCoordinates[0]][destCoordinates[1]].isWall = false;
    grid[destCoordinates[0]][destCoordinates[1]].isFinish = true;
  }
  clickedDraggableNodes = false;
};

// array of grid cells DOM
const cellArray = document.getElementsByClassName("grid-cell");
const assignRandomWeights = async () => {
  for (let i = 0; i < ROWSIZE; i++) {
    for (let j = 0; j < COLUMNSIZE; j++) {
      cellArray[i * COLUMNSIZE + j].className = "grid-cell";
      grid[i][j].isWall = false;
      grid[i][j].isVisited = false;
      if (grid[i][j].weight) {
        grid[i][j].weight = 0;
        cellArray[i].removeChild(cellArray[i * COLUMNSIZE + j].childNodes[1]);
      }
      if (Math.random() > 0.7)
        addWeightToCell(cellArray[i * COLUMNSIZE + j], i, j);
    }
  }
}

//function to clear the board and stop the visualizer
const clearBoard = () => {
  visualizerFlag = false;
  startSymbol.draggable = true;
  startButton.innerText = "Start";
  for (let i = 0; i < NO_OF_NODES; i++) {
    let row = Math.floor(i / COLUMNSIZE);
    let col = i % COLUMNSIZE;
    cellArray[i].className = "grid-cell";
    grid[row][col].isWall = false;
    grid[row][col].isVisited = false;
    if (grid[row][col].weight) {
      grid[row][col].weight = 0;
      cellArray[i].removeChild(cellArray[i].childNodes[1]);
    }
  }
};


const resetVisualization = () => {
  for (let i = 0; i < ROWSIZE; i++) {
    for (let j = 0; j < COLUMNSIZE; j++) {
      if (grid[i][j].isVisited) {
        grid[i][j].previousNode = null;
        if (!grid[i][j].isWall && !grid[i][j].weight)
          cellArray[i * COLUMNSIZE + j].className = "grid-cell";
        if (grid[i][j].weight && grid[i][j].isVisited)
          cellArray[i * COLUMNSIZE + j].className = "grid-cell weight";
        grid[i][j].isVisited = false;

      }
    }
  }
}

const stopVisualizer = () => {
  visualizerFlag = false;
  resetBoardButton.disabled = false;
  clearBoardButton.disabled = false;
  selectPatternButton.disabled = false;
  startSymbol.draggable = true;
  startButton.innerText = "start";
};

const startVisualizerHandler = async (e) => {
  if (visualizerFlag) {
    stopVisualizer();
  } else {
    clearBoardButton.disabled = true;
    resetBoardButton.disabled = true;
    selectPatternButton.disabled = true;
    startSymbol.draggable = false;
    resetVisualization();
    visualizerFlag = true;
    startButton.innerText = "Stop";
    await algorithms[selectedAlgorithm]();
    if (visualizerFlag)
      await drawShortestPath();
    stopVisualizer();

  }
};
const drawShortestPath = async () => {
  let node = grid[destCoordinates[0]][destCoordinates[1]];
  let shortestPathArray = [];
  while (node != null) {
    shortestPathArray.unshift(node);
    node = node.previousNode;
  }
  for (let i = 0; i < shortestPathArray.length && visualizerFlag; i++) {
    node = shortestPathArray[i];
    cellArray[node.row * COLUMNSIZE + node.col].className = "grid-cell shortestPath";
    await sleep(20);
  }
}

//the starting cell
let startNodeElement = document.getElementById(
  `cell-${startCoordinates[0]}-${startCoordinates[1]}`
);

let startSymbol = document.createElement('img');
startSymbol.src = './assets/navigation_symbol.png';
startSymbol.id = 'start-node-image'
startNodeElement.appendChild(startSymbol);
startSymbol.draggable = true;
startSymbol.addEventListener("dragstart", () => {
  nodeOnDrag = "startNode";
});

let destNodeElement = document.getElementById(
  `cell-${destCoordinates[0]}-${destCoordinates[1]}`
);
let destSymbol = document.createElement('img');
destSymbol.src = './assets/dest_radio.png';
destSymbol.id = 'dest-node-image';
destNodeElement.appendChild(destSymbol);
destSymbol.draggable = true;
destSymbol.addEventListener("dragstart", () => {
  nodeOnDrag = "destNode";
});

const startButton = document.getElementById("start-button");
const clearBoardButton = document.getElementById("clearBoard-button");
const resetBoardButton = document.getElementById("reset-button");
startButton.disabled = true;

const selectPatternDropdownElement = document.getElementById("select-pattern-dropdown-container");
const selectAlgorithmDropdownElement = document.getElementById("select-algorithm-dropdown-container");
const selectAlgorithmButton = document.getElementById("select-algorithm");
const selectPatternButton = document.getElementById("select-pattern");

const selectAlgorithmDropdownHandler = (event) => {
  if (selectAlgorithmDropdownElement.style.display == "none") {
    selectAlgorithmDropdownElement.style.display = "block";
  }
  else selectAlgorithmDropdownElement.style.display = "none";
};

const selectPatternDropdownHandler = (event) => {
  if (selectPatternDropdownElement.style.display == "none") {
    selectPatternDropdownElement.style.display = "block";
  }
  else selectPatternDropdownElement.style.display = "none";
};

const selectPatternHandler = async (pattern) => {
  clearBoard();
  patternFlag = true;
  selectPatternButton.disabled = true;
  clearBoardButton.disabled = true;
  if (selectedAlgorithm.length)
    startButton.disabled = true;
  switch (pattern) {
    case "Randomized DFS (high river)":
      await randomizedDFS(true);
      break;
    case "Randomized DFS (more branches)":
      await randomizedDFS(false);
      break;
    case "Prim's Algorithm":
      await PrimsMaze();
      break;
    case "Recursive Division":
      await wallTheBorders();
      await recursiveDivision(0, 0, ROWSIZE - 1, COLUMNSIZE - 1);
      break;
    case "Random weights":
      await assignRandomWeights();
      break;
    default:
      break;
  }
  patternFlag = false;
  selectPatternButton.disabled = false;
  clearBoardButton.disabled = false;
  if (selectedAlgorithm.length)
    startButton.disabled = false;
}
const onBlurSelectAlgorithmDropdownHandler = () => {
  selectAlgorithmDropdownElement.style.display = "none";
};
const onBlurSelectPatternDropdownHandler = () => {
  selectPatternDropdownElement.style.display = "none";
};

const selectAlgorithmHandler = (algorithm) => {
  selectedAlgorithm = algorithm;
  selectAlgorithmButton.children[0].innerText = algorithm;
  startButton.disabled = false;
  clearBoardButton.disabled = false;
  // selectAlgorithmDropdownElement.style.display = "none";
};

