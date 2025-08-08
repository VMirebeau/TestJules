const ZOOM = 2;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyX: false, KeyC: false, KeyE: false
};

let playerSheet;
window.globalGameAssets = {};
let lastTime = 0;

const TILE = { FLOOR: 0, WALL: 1, DOOR_CLOSED: 2, DOOR_OPEN: 3, SWITCH_OFF: 4, SWITCH_ON: 5 };

function handlePlayerInput() {
    if (camera.isTransitioning || player.isAttacking || dialogueManager.isActive) {
        player.isMoving = false;
        return;
    }
    player.isMoving = false;
    let nextX = player.x;
    let nextY = player.y;
    if (keys.ArrowUp) { nextY -= player.speed; player.direction = 'up'; player.isMoving = true; }
    if (keys.ArrowDown) { nextY += player.speed; player.direction = 'down'; player.isMoving = true; }
    if (keys.ArrowLeft) { nextX -= player.speed; player.direction = 'left'; player.isMoving = true; }
    if (keys.ArrowRight) { nextX += player.speed; player.direction = 'right'; player.isMoving = true; }
    if (nextX !== player.x && !worldManager.isSolid(nextX, player.y)) player.x = nextX;
    if (nextY !== player.y && !worldManager.isSolid(player.x, nextY)) player.y = nextY;
}

function update(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!worldManager.currentMap || dialogueManager.isActive) {
        camera.update(deltaTime);
        return;
    }

    handlePlayerInput();

    if (player.isAttacking) {
        player.attackTimer -= deltaTime;
        if (player.attackTimer < player.attackDuration / 2 && !player.hitbox) {
            createAttackHitbox();
            checkInteractions();
        }
        if (player.attackTimer <= 0) { player.isAttacking = false; player.hitbox = null; }
    }

    const anim_prefix = player.isAttacking ? 'attack_' : (player.isMoving ? 'walk_' : 'idle_');
    player.animator.setAnimation(anim_prefix + player.direction);
    player.animator.update(deltaTime);

    worldManager.update(deltaTime);
    if (!camera.isTransitioning) {
        worldManager.checkForRoomTransition(player);
        checkPlayerProjectileCollision();
    }
    camera.update(deltaTime);
}

function tryInteraction() {
    if (dialogueManager.isActive || camera.isTransitioning) return;
    for (const npc of worldManager.npcs) {
        if (Math.hypot(player.x - npc.x, player.y - npc.y) < 50) {
            if(npc.dialogue_id) {
                startDialogueById(npc.dialogue_id);
            }
            return;
        }
    }
}

const DIALOGUES = {
    'socrates_1': { text: "Connais-toi toi-même." },
    'plato_guardian': {
        text: "Héritier de la pensée, pour passer, tu dois distinguer le vrai du faux. Qu'est-ce qui est le plus réel : l'ombre d'un objet sur le mur d'une caverne, ou l'Idée parfaite de cet objet ?",
        choices: [
            { text: "L'ombre, car je peux la voir.", value: 'wrong' },
            { text: "L'Idée, car elle est éternelle et immuable.", value: 'correct' },
            { text: "Les deux sont aussi réels l'un que l'autre.", value: 'wrong' }
        ]
    }
};

function startDialogueById(id) {
    const dialogueData = DIALOGUES[id];
    if (!dialogueData) return;

    if (id === 'plato_guardian') {
        dialogueManager.startDialogue(dialogueData, (choice) => {
            if (choice === 'correct') {
                const bossDoor = worldManager.interactiveObjects.find(d => d.id === 'boss_door');
                if (bossDoor) worldManager.updateTile(bossDoor.x / 32, bossDoor.y / 32, TILE.DOOR_OPEN);
                dialogueManager.startDialogue({ text: "Sage décision. La voie est libre." });
            } else {
                dialogueManager.startDialogue({ text: "Ta perception te trompe. Médite encore sur les apparences et l'essence." });
            }
        });
    } else {
        dialogueManager.startDialogue(dialogueData);
    }
}


function createAttackHitbox() { /* ... */ }
function checkInteractions() { /* ... */ }
function checkPlayerProjectileCollision() { /* ... */ }


function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(ZOOM, ZOOM);
    ctx.translate(-camera.x, -camera.y);

    worldManager.draw();

    if (playerSheet && player.animator) {
        const { sx, sy } = player.animator.getCurrentFrame();
        ctx.drawImage(playerSheet, sx, sy, player.width, player.height, player.x, player.y, player.width, player.height);
    }

    // Dessiner les objets interactifs (comme les interrupteurs visibles)
    const lightRadius = 100;
    for (const obj of worldManager.interactiveObjects) {
        const isVisible = (player.isUsingItem && player.currentItem === 'lantern' && Math.hypot(player.x - obj.x, player.y - obj.y) < lightRadius);
        if (obj.type === 'hiddenSwitch' && (isVisible || obj.state === 'on')) {
            const tileIndex = (obj.state === 'on') ? TILE.SWITCH_ON : TILE.SWITCH_OFF;
            ctx.drawImage(worldManager.currentTileset, tileIndex * 32, 0, 32, 32, obj.x, obj.y, 32, 32);
        }
    }

    if (player.hitbox) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(player.hitbox.x, player.hitbox.y, player.hitbox.width, player.hitbox.height);
    }

    if (worldManager.currentMap.id.includes('dungeon') && player.isUsingItem && player.currentItem === 'lantern') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(camera.x, camera.y, camera.width, camera.height);
        ctx.globalCompositeOperation = 'destination-out';
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const gradient = ctx.createRadialGradient(playerCenterX, playerCenterY, lightRadius * 0.5, playerCenterX, playerCenterY, lightRadius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(playerCenterX, playerCenterY, lightRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }

    // Effet visuel du Compas du Cogito
    if (player.isUsingItem && player.currentItem === 'compass') {
        for (const enemy of worldManager.enemies) {
            if (enemy instanceof MalinGenie && !enemy.isIllusion) {
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        }
    }

    ctx.restore();
}

function gameLoop(timestamp) { update(timestamp); draw(); requestAnimationFrame(gameLoop); }

window.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.code === 'KeyX') player.isUsingItem = !player.isUsingItem;
    if (e.code === 'KeyC' && !player.isAttacking && !camera.isTransitioning) { player.isAttacking = true; player.attackTimer = player.attackDuration; }
    if (e.code === 'KeyE') tryInteraction();
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});
window.addEventListener('keyup', (e) => { e.preventDefault(); if (keys.hasOwnProperty(e.code)) keys[e.code] = false; });

async function main() {
    console.log("Chargement des assets globaux...");
    try {
        const assets = await loadAssets([
            { name: 'playerSheet', type: 'image', src: 'assets/sprites/player_sheet.png' },
            { name: 'sophismSheet', type: 'image', src: 'assets/sprites/sophism_sheet.png' },
            { name: 'ombreSheet', type: 'image', src: 'assets/sprites/ombre_sheet.png' },
            { name: 'demiurgeSheet', type: 'image', src: 'assets/sprites/demiurge_sheet.png' },
            { name: 'npcSocratesSheet', type: 'image', src: 'assets/sprites/npc_socrates_sheet.png' },
            // Tilesets
            { name: 'overworldTileset', type: 'image', src: 'assets/tilesets/basic_tileset.png' },
            { name: 'dungeonTileset', type: 'image', src: 'assets/tilesets/dungeon_tileset.png' },
            { name: 'descartesTileset', type: 'image', src: 'assets/tilesets/descartes_tileset.png' },
            // Maps
            { name: 'overworldMap', type: 'json', src: 'assets/maps/level1.json' },
            { name: 'dungeonPlatoMap', type: 'json', src: 'assets/maps/dungeon_plato_1.json' },
            { name: 'dungeonDescartesMap', type: 'json', src: 'assets/maps/dungeon_descartes.json' },
            // Bosses
            { name: 'demiurgeSheet', type: 'image', src: 'assets/sprites/demiurge_sheet.png' },
            { name: 'malinGenieSheet', type: 'image', src: 'assets/sprites/malin_genie_sheet.png' }
        ]);
        window.globalGameAssets = assets;
        playerSheet = assets.playerSheet;

        const playerAnimations = {
            'idle_down':  { row: 0, frames: [0], speed: 1000 }, 'walk_down':  { row: 0, frames: [0, 1, 2, 3], speed: 150 },
            'idle_up':    { row: 1, frames: [0], speed: 1000 }, 'walk_up':    { row: 1, frames: [0, 1, 2, 3], speed: 150 },
            'idle_left':  { row: 2, frames: [0], speed: 1000 }, 'walk_left':  { row: 2, frames: [0, 1, 2, 3], speed: 150 },
            'idle_right': { row: 3, frames: [0], speed: 1000 }, 'walk_right': { row: 3, frames: [0, 1, 2, 3], speed: 150 },
            'attack_down':{ row: 4, frames: [0], speed: player.attackDuration },
            'attack_up':  { row: 4, frames: [1], speed: player.attackDuration },
            'attack_left':{ row: 4, frames: [2], speed: player.attackDuration },
            'attack_right':{ row: 4, frames: [3], speed: player.attackDuration },
        };
        player.animator = new Animator(playerSheet, 32, 32, playerAnimations);

        camera.setViewport(canvas.width / ZOOM, canvas.height / ZOOM);

        // Démarrer sur la carte du monde pour tester le hub
        await worldManager.loadMap(window.globalGameAssets.overworldMap, player, 1, 1);
        player.x = (1 * worldManager.roomWidth) + 200;
        player.y = (1 * worldManager.roomHeight) + 200;

        console.log("Lancement du jeu !");
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
    }
}

main();
