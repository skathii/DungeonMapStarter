import map from './map.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const miniMapCanvas = document.getElementById('miniMapCanvas');
const miniMapCtx = miniMapCanvas.getContext('2d');

const tileSize = 32;
const viewportWidth = 16; // Number of tiles visible in the viewport width
const viewportHeight = 12; // Number of tiles visible in the viewport height

// Calculate mini-map tile size dynamically
const miniMapScale = 1.5; // Scale factor for mini-map size relative to main canvas
const miniMapMaxWidth = canvas.width * miniMapScale;
const miniMapMaxHeight = canvas.height * miniMapScale;
const miniMapTileSizeX = miniMapMaxWidth / map[0].length;
const miniMapTileSizeY = miniMapMaxHeight / map.length;
const miniMapTileSize = Math.min(miniMapTileSizeX, miniMapTileSizeY); // Use the smaller of the two to maintain aspect ratio

// Set canvas size to the viewport size
canvas.width = viewportWidth * tileSize;
canvas.height = viewportHeight * tileSize;

// Set the size of the mini-map canvas
miniMapCanvas.width = map[0].length * miniMapTileSize;
miniMapCanvas.height = map.length * miniMapTileSize;

const ladderCoordinatesElement = document.getElementById('ladderCoordinates');
const mapWidthElement = document.getElementById('mapWidth');
const mapHeightElement = document.getElementById('mapHeight');
const characterPositionElement = document.getElementById('characterPosition');


const tileSprites = {
    0: 'assets/ladder.png',
    1: 'assets/tile0.png',  // Walkable tiles (Green)
    2: 'assets/tile1.png', // Unwalkable tiles (Blue)
};

const tiles = {};
const character = {
    x: 1, // Starting x position
    y: 1, // Starting y position
    sprite: new Image()
};

character.sprite.src = 'assets/character.png'; // Path to your character sprite

function loadImages(sources, callback) {
    let loadedImages = 0;
    let numImages = Object.keys(sources).length;

    for (let src in sources) {
        tiles[src] = new Image();
        tiles[src].onload = function () {
            loadedImages++;
            if (loadedImages >= numImages) {
                callback();
            }
        };
        tiles[src].onerror = function() {
            console.error(`Failed to load image: ${sources[src]}`);
            loadedImages++;
            if (loadedImages >= numImages) {
                callback();
            }
        };
        tiles[src].src = sources[src];
    }

    // Load character sprite
    character.sprite.onload = function () {
        loadedImages++;
        if (loadedImages >= numImages + 1) {
            callback();
        }
    };
    character.sprite.onerror = function() {
        console.error(`Failed to load image: character.png`);
        loadedImages++;
        if (loadedImages >= numImages + 1) {
            callback();
        }
    };
}

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxStartX = Math.max(0, character.x - Math.floor(viewportWidth / 2));
    const maxStartY = Math.max(0, character.y - Math.floor(viewportHeight / 2));
    const startX = Math.min(maxStartX, map[0].length - viewportWidth);
    const startY = Math.min(maxStartY, map.length - viewportHeight);

    for (let y = startY; y < startY + viewportHeight; y++) {
        for (let x = startX; x < startX + viewportWidth; x++) {
            let tileType = (x >= 0 && x < map[0].length && y >= 0 && y < map.length) ? map[y][x] : 2;
            if (tiles[tileType] && tiles[tileType].complete) {
                ctx.drawImage(tiles[tileType], (x - startX) * tileSize, (y - startY) * tileSize, tileSize, tileSize);
            } else if (!tiles[tileType]) {
                ctx.fillStyle = 'black';
                ctx.fillRect((x - startX) * tileSize, (y - startY) * tileSize, tileSize, tileSize);
                console.error(`Tile image not loaded or not found for tile type: ${tileType} at position (${x}, ${y})`);
            }
        }
    }
}

function drawCharacter() {
    const maxStartX = Math.max(0, character.x - Math.floor(viewportWidth / 2));
    const maxStartY = Math.max(0, character.y - Math.floor(viewportHeight / 2));
    const startX = Math.min(maxStartX, map[0].length - viewportWidth);
    const startY = Math.min(maxStartY, map.length - viewportHeight);

    const charX = (character.x - startX) * tileSize;
    const charY = (character.y - startY) * tileSize;
    ctx.drawImage(character.sprite, charX, charY, tileSize, tileSize);
}

const seenTiles = new Set();

function drawMiniMap() {
    miniMapCtx.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);

    // Mark tiles in the viewport as seen
    const maxStartX = Math.max(0, character.x - Math.floor(viewportWidth / 2));
    const maxStartY = Math.max(0, character.y - Math.floor(viewportHeight / 2));
    const startX = Math.min(maxStartX, map[0].length - viewportWidth);
    const startY = Math.min(maxStartY, map.length - viewportHeight);

    for (let y = startY; y < startY + viewportHeight; y++) {
        for (let x = startX; x < startX + viewportWidth; x++) {
            seenTiles.add(`${x},${y}`);
        }
    }

    // Draw the mini-map
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (seenTiles.has(`${x},${y}`)) {
                let tileType = map[y][x];
                if (tiles[tileType] && tiles[tileType].complete) {
                    miniMapCtx.drawImage(tiles[tileType], x * miniMapTileSize, y * miniMapTileSize, miniMapTileSize, miniMapTileSize);
                } else if (!tiles[tileType]) {
                    miniMapCtx.fillStyle = 'black';
                    miniMapCtx.fillRect(x * miniMapTileSize, y * miniMapTileSize, miniMapTileSize, miniMapTileSize);
                    console.error(`Tile image not loaded or not found for tile type: ${tileType} at position (${x}, ${y})`);
                }
            }
        }
    }

    // Draw the character on the mini-map
    miniMapCtx.fillStyle = 'yellow';
    miniMapCtx.fillRect(character.x * miniMapTileSize, character.y * miniMapTileSize, miniMapTileSize, miniMapTileSize);
}

function updateMenu() {
    ladderCoordinatesElement.textContent = `${ladderTile.x}, ${ladderTile.y}`;
    mapWidthElement.textContent = map[0].length;
    mapHeightElement.textContent = map.length;
    characterPositionElement.textContent = `${character.x}, ${character.y}`;
}

function gameLoop() {
    drawMap();
    drawCharacter();
    drawMiniMap();
    updateMenu();
    requestAnimationFrame(gameLoop);
}

function findLadderTile() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 0) {
                return { x, y };
            }
        }
    }
    return null; // If no ladder tile is found
}

// Set the character's initial position to the ladder tile
const ladderTile = findLadderTile();
if (ladderTile) {
    character.x = ladderTile.x;
    character.y = ladderTile.y;
}

loadImages(tileSprites, function() {
    gameLoop();
});

window.addEventListener('keydown', function(event) {
    const oldX = character.x;
    const oldY = character.y;

    switch(event.key) {
        case 'ArrowUp':
            if (character.y > 0 && map[character.y - 1][character.x] !== 2) character.y--;
            break;
        case 'ArrowDown':
            if (character.y < map.length - 1 && map[character.y + 1][character.x] !== 2) character.y++;
            break;
        case 'ArrowLeft':
            if (character.x > 0 && map[character.y][character.x - 1] !== 2) character.x--;
            break;
        case 'ArrowRight':
            if (character.x < map[0].length - 1 && map[character.y][character.x + 1] !== 2) character.x++;
            break;
    }

    if (oldX !== character.x || oldY !== character.y) {
        drawMap();
        drawCharacter();
        drawMiniMap();
    }
});
