console.log("Le jeu de philo-zelda se lance !");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ici, nous allons définir les variables du jeu
const player = {
    x: 50,
    y: 50,
    width: 20,
    height: 20,
    speed: 4
};

const dungeonEntrance = {
    x: 700,
    y: 50,
    width: 50,
    height: 50
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

function gameLoop() {
    // 1. Mettre à jour l'état du jeu (positions, etc.)
    update();

    // 2. Dessiner les éléments du jeu
    draw();

    // 3. Rappeler la boucle de jeu pour la prochaine frame
    requestAnimationFrame(gameLoop);
}

function update() {
    // Mouvement vertical
    if (keys.ArrowUp) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown) {
        player.y += player.speed;
    }
    // Mouvement horizontal
    if (keys.ArrowLeft) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight) {
        player.x += player.speed;
    }

    // Gestion des collisions avec les bords du canvas
    // Bord gauche
    if (player.x < 0) {
        player.x = 0;
    }
    // Bord droit
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
    // Bord haut
    if (player.y < 0) {
        player.y = 0;
    }
    // Bord bas
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // Gestion de la collision avec l'entrée du donjon
    if (
        player.x < dungeonEntrance.x + dungeonEntrance.width &&
        player.x + player.width > dungeonEntrance.x &&
        player.y < dungeonEntrance.y + dungeonEntrance.height &&
        player.y + player.height > dungeonEntrance.y
    ) {
        console.log("Le joueur est sur l'entrée du donjon !");
        // Ici, on pourrait déclencher le changement de niveau
    }
}

function draw() {
    // Dessiner l'arrière-plan (le monde)
    ctx.fillStyle = '#34a853'; // Un vert pour l'herbe
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner l'entrée du donjon
    ctx.fillStyle = '#333'; // Un gris foncé pour l'entrée
    ctx.fillRect(dungeonEntrance.x, dungeonEntrance.y, dungeonEntrance.width, dungeonEntrance.height);

    // Dessiner le joueur (un sprite simple)
    // Corps
    ctx.fillStyle = '#4285f4'; // Un bleu pour la tunique
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Tête
    ctx.fillStyle = '#fbbc05'; // Un jaune pour la tête
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - player.height / 2, player.width / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Lancer la boucle de jeu
gameLoop();
