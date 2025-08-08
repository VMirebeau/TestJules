class Projectile {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.speed = 5;
        this.isAlive = true;

        // Calculer la direction vers la cible
        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        // Se détruire si sort de l'écran (simple)
        const room = worldManager.getRoomCoords();
        if (this.x < room.x || this.x > room.x + worldManager.roomWidth ||
            this.y < room.y || this.y > room.y + worldManager.roomHeight) {
            this.isAlive = false;
        }
    }

    draw() {
        ctx.fillStyle = '#ea4335'; // Rouge
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
