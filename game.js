let timing = 0;
let w, h, m, field, dug, time0, time;
let digs = 0;
let flags = 0;
let chordCheck = 0;
let size = 40; // Size of each tile in pixels

timerDsiplay = document.getElementById("displayTime")
remDisplay = document.getElementById("displayRem")

const fragment = window.location.hash.substring(1);

if (fragment) {
    runSafeFragment(fragment);
}        

function runSafeFragment(fragment) {
    const initMatch = fragment.match(/^init\((\d+),(\d+),(\d+)\)$/);
    if (initMatch) {
        const [, w, h, m] = initMatch.map(Number);
        init(w, h, m);
    }        
}        

function createTable(tableData) {
    document.getElementById("game-board").style.width = `${size * w}px`
    var table = document.createElement('table');
    
    var tableBody = document.createElement('tbody');

    tableData.forEach((rowData, rowIndex) => {
        var row = document.createElement('tr');

        rowData.forEach((_, colIndex) => {
            var cell = document.createElement('td');
            cell.style.height = `${size}px`;
            cell.style.width = `${size}px`;
            cell.class = "cell";

            var img = document.createElement('img');
            img.src = `./tile_textures/cover.png`;
            img.draggable = false; // Prevent dragging
            img.className = "cover";
            img.addEventListener("click", function() {
                dig(colIndex, rowIndex);
            });
            img.addEventListener("contextmenu", function(event) {
                flag(colIndex, rowIndex);
                event.preventDefault(); // Prevent the context menu from appearing
            });
            img.id = `tile_${colIndex}_${rowIndex}`;
            cell.appendChild(img);
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    document.getElementById("game-board").innerHTML = ""; // Clear previous board
    document.getElementById("game-board").appendChild(table); // Add new board

    let vb = document.getElementsByClassName("vb");
    for (let i = 0; i < vb.length; i++) {
        vb[i].style.width = `${size/2}px`;
        vb[i].style.height = `${size*h}px`;
    }

    let hb = document.getElementsByClassName("hb");
    for (let i = 0; i < hb.length; i++) {
        hb[i].style.width = `${size*w}px`;
        hb[i].style.height = `${size/2}px`;
    }
    
    let corner = document.getElementsByClassName("corner");
    for (let i = 0; i < corner.length; i++) {
        corner[i].style.width = `${size/2}px`;
        corner[i].style.height = `${size/2}px`;
    }
}

function create2DList(rows, cols, initialValue) {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
}

function init(width, height, mineCount) {
    digs = 0;
    flags = 0;
    timing = 0;
    time = 0;
    timerDsiplay.style.color = "#000";
    timerDsiplay.innerHTML = "0.00";
    remDisplay.innerHTML = mineCount;
    w = width; h = height; m = mineCount;
    field = create2DList(height, width, 0);
    dug = create2DList(height, width, 0);
    createTable(field);
}

function dig(x, y){
    let tile = document.getElementById(`tile_${x}_${y}`);
    if (!tile) return; // Prevent re-digging

    if (!timing) {
        start(x, y);
        return;
    }

    else if (timing == 1) {
        if (dug[y][x] == 0) {
            tile.src = `./tile_textures/${field[y][x]}.png`;
            dug[y][x] = 1; // Mark as dug

            if (field[y][x] === 0) {
                zerochord(x, y);
            }
            if (field[y][x] === -1) {
                explode(x, y);
                timerDsiplay.style.color = "#F00";
            }
            else digs++;
            if (digs == (w * h - m)) {
                timing = 2;
                let date = new Date();
                time = (date.getTime() - time0) / 1000;
                timerDsiplay.innerHTML = time;
                timerDsiplay.style.color = "#0F0";
                reveal();
            }
        }
        if (dug[y][x] == 1) {
            digchord(x, y);
        }
    }
}

function flag(x, y){
    if (timing == 1){
        let tile = document.getElementById(`tile_${x}_${y}`);
        if (dug[y][x]==0) {
            tile.src = `./tile_textures/flag.png`;
            dug[y][x] = 2; // Mark as flagged
            flags++;
        }
        else if (dug[y][x]==2) {
            // Unflagging
            tile.src = `./tile_textures/cover.png`;
            tile.addEventListener("click", function() {
                dig(x, y);
            });
            dug[y][x] = 0; // Mark as not flagged
            flags--;
        }
        else if (dug[y][x]==1) {
            flagchord(x, y);
        }
        remDisplay.innerHTML = m - flags;
    }
}

function start(x, y){
    lay_mines(w, h, m, x, y);
    numbers();
    timing = 1;
    let date = new Date();
    time0 = date.getTime();
    dig(x, y);
    // Start the timer
}

function lay_mines(width, height, mineCount, x, y){
    // x and y are the coordinates of the first cell clicked and should not contain a mine
    let emptyCells = [];
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (Math.abs(i - y) > 1 || Math.abs(j - x) > 1) {
                emptyCells.push([i, j]);
            }
        }
    }
    for (let i = 0; i < mineCount; i++){
        let randomIndex = Math.floor(Math.random() * emptyCells.length);
        let cell = emptyCells[randomIndex];
        field[cell[0]][cell[1]] = -1; // Place a mine
        emptyCells.splice(randomIndex, 1); // Remove the cell from the list
    }
}

function numbers(){
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (field[i][j] === -1) {
                // Increment the count for surrounding cells
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (i + x >= 0 && i + x < h && j + y >= 0 && j + y < w) {
                            if (field[i + x][j + y] !== -1) {
                                field[i + x][j + y]++;
                            }
                        }
                    }
                }
            }
        }
    }
}

function zerochord(x, y) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newX = x + j;
            let newY = y + i;

            if (newX >= 0 && newX < w && newY >= 0 && newY < h && !dug[newY][newX]) {
                dig(newX, newY);
            }
        }
    }
}

function digchord(x, y) {
    chordCheck = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newX = x + j;
            let newY = y + i;

            if (newX >= 0 && newX < w && newY >= 0 && newY < h && (newX != x || newY != y)) {
                if (dug[newY][newX] == 2) {
                    chordCheck++;
                }
            }
        }
    }
    
    if (chordCheck == field[y][x]) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newX = x + j;
                let newY = y + i;

                if (newX >= 0 && newX < w && newY >= 0 && newY < h) {
                    let chordtile = document.getElementById(`tile_${newX}_${newY}`);
                    if (chordtile.src.includes("cover.png")) {
                        dig(newX, newY);
                    }
                }
            }
        }
    }
}

function flagchord(x, y) {
    chordCheck = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newX = x + j;
            let newY = y + i;

            if (newX >= 0 && newX < w && newY >= 0 && newY < h && (newX != x || newY != y)) {
                if (dug[newY][newX] != 1) {
                    chordCheck++;
                }
            }
        }
    }
    
    if (chordCheck == field[y][x]) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newX = x + j;
                let newY = y + i;

                if (newX >= 0 && newX < w && newY >= 0 && newY < h) {
                    let chordtile = document.getElementById(`tile_${newX}_${newY}`);
                    if (chordtile.src.includes("cover.png")) {
                        flag(newX, newY);
                    }
                }
            }
        }
    }
}

function reveal() {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            let tile = document.getElementById(`tile_${j}_${i}`);
            if (tile.src.includes("cover.png")) {
                if (field[i][j] === -1) {
                    tile.src = `./tile_textures/-1.png`;
                }
            }
            if (tile.src.includes("flag.png")) {
                if (field[i][j] !== -1) {
                    tile.src = `./tile_textures/wrong.png`;
                }
                else {
                    tile.src = `./tile_textures/flag.png`;
                }
            }
        }
    }
}

function explode(x, y) {
    timing = 2;
    let tile = document.getElementById(`tile_${x}_${y}`);
    reveal();
    tile.src = `./tile_textures/explode.png`;
}

function updateTimer() {
    if (timing == 1) {
        let date = new Date();
        time = (date.getTime() - time0) / 1000;
        timerDsiplay.innerHTML = time.toFixed(2);
    }
}

setInterval(updateTimer, 50);