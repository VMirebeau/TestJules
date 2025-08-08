const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

let gameAssets = {};

const assetsToLoad = [
    { name: 'playerSheet', type: 'image', src: 'assets/sprites/player_sheet.png' },
    { name: 'tileset', type: 'image', src: 'assets/tilesets/basic_tileset.png' },
    { name: 'level1', type: 'json', src: 'assets/maps/level1.json' }
];

// --- Fonctions de jeu ---

function checkCollision(x, y) {
    // Vérifie les 4 coins du rectangle du joueur
    const corners = [
        { x: x, y: y },
        { x: x + player.width - 1, y: y },
        { x: x, y: y + player.height - 1 },
        { x: x + player.width - 1, y: y + player.height - 1 }
    ];

    for (const corner of corners) {
        if (isSolidTile(corner.x, corner.y, gameAssets.level1)) {
            return true;
        }
    }
    return false;
}

function update() {
    let nextX = player.x;
    let nextY = player.y;
    player.isMoving = false;

    // Calculer le prochain mouvement et définir la direction
    if (keys.ArrowUp) {
        nextY -= player.speed;
        player.direction = 'up';
        player.isMoving = true;
    }
    if (keys.ArrowDown) {
        nextY += player.speed;
        player.direction = 'down';
        player.isMoving = true;
    }
    if (keys.ArrowLeft) {
        nextX -= player.speed;
        player.direction = 'left';
        player.isMoving = true;
    }
    if (keys.ArrowRight) {
        nextX += player.speed;
        player.direction = 'right';
        player.isMoving = true;
    }

    // Gérer les collisions
    if (nextX !== player.x && !checkCollision(nextX, player.y)) {
        player.x = nextX;
    }
    if (nextY !== player.y && !checkCollision(player.x, nextY)) {
        player.y = nextY;
    }

    // Mettre à jour l'animation
    const anim_prefix = player.isMoving ? 'walk_' : 'idle_';
    player.animator.setAnimation(anim_prefix + player.direction);
    player.animator.update();

    // Mettre à jour la caméra
    camera.update(player, gameAssets.level1);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    if (gameAssets.level1 && gameAssets.tileset) {
        drawMap(gameAssets.level1, gameAssets.tileset, camera);
    }

    // Dessiner le joueur avec la bonne frame d'animation
    if (gameAssets.playerSheet && player.animator) {
        const { sx, sy } = player.animator.getCurrentFrame();
        ctx.drawImage(
            gameAssets.playerSheet,
            sx, sy, player.width, player.height, // Source rectangle
            player.x, player.y, player.width, player.height  // Destination rectangle
        );
    }

    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Initialisation et lancement ---

window.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
});

async function main() {
    console.log("Chargement des assets...");
    try {
        gameAssets = await loadAssets(assetsToLoad);
        console.log("Assets chargés avec succès !", gameAssets);

        // Initialiser l'animateur du joueur
        const playerAnimations = {
            'idle_down':  { row: 0, frames: [0], speed: 1000 },
            'walk_down':  { row: 0, frames: [0, 1, 2, 3], speed: 150 },
            'idle_up':    { row: 1, frames: [0], speed: 1000 },
            'walk_up':    { row: 1, frames: [0, 1, 2, 3], speed: 150 },
            'idle_left':  { row: 2, frames: [0], speed: 1000 },
            'walk_left':  { row: 2, frames: [0, 1, 2, 3], speed: 150 },
            'idle_right': { row: 3, frames: [0], speed: 1000 },
            'walk_right': { row: 3, frames: [0, 1, 2, 3], speed: 150 },
        };
        player.animator = new Animator(
            gameAssets.playerSheet,
            32, // frame width
            32, // frame height
            playerAnimations
        );

        // La taille du joueur est définie par la taille d'une frame d'animation
        player.width = 32;
        player.height = 32;

        console.log("Lancement du jeu !");
        gameLoop();
    } catch (error) {
        console.error("Erreur lors du chargement des assets:", error);
        // Afficher un message d'erreur sur le canvas
        ctx.fillStyle = 'red';
        ctx.font = '20px sans-serif';
        ctx.fillText("Erreur: Impossible de charger les ressources du jeu.", 20, 50);
    }
}

main();
