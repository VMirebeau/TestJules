class Enemy {
    constructor(x, y, spriteSheet) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 1;
        this.health = 3;
        this.isAlive = true;
        this.animator = null; // Sera initialisé par la sous-classe
        this.spriteSheet = spriteSheet;
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`Ennemi touché ! Vie restante : ${this.health}`);
        if (this.health <= 0) {
            this.isAlive = false;
            console.log("Ennemi vaincu !");
        }
    }

    update() {
        // La logique de mouvement (IA) sera définie dans les sous-classes
        if (this.animator) {
            this.animator.update();
        }
    }

    draw(camera) {
        if (this.spriteSheet && this.animator) {
            const { sx, sy } = this.animator.getCurrentFrame();
            ctx.drawImage(
                this.spriteSheet,
                sx, sy, this.width, this.height,
                this.x - camera.x, this.y - camera.y, this.width, this.height
            );
        }
    }
}

const BossState = { IDLE: 0, TELEPORTING: 1, ATTACKING: 2 };

class Demiurge extends Enemy {
    constructor(x, y, spriteSheet) {
        super(x, y, spriteSheet);
        this.width = 64;
        this.height = 64;
        this.health = 20;
        this.state = BossState.IDLE;
        this.stateTimer = 3000; // 3 secondes en idle

        const animations = {
            'idle': { row: 0, frames: [0, 1, 2, 3], speed: 200 },
            'attack': { row: 1, frames: [0, 1, 2, 3], speed: 100 },
        };
        this.animator = new Animator(this.spriteSheet, 64, 64, animations);
        this.animator.setAnimation('idle');
    }

    takeDamage(amount) {
        if (player.isUsingItem && player.currentItem === 'lantern') {
            super.takeDamage(amount);
        } else {
            console.log("Le Démiurge est protégé par les ombres !");
        }
    }

    update(deltaTime) {
        this.stateTimer -= deltaTime;

        if (this.stateTimer <= 0) {
            this.changeState();
        }

        if (this.state === BossState.ATTACKING) {
            this.animator.setAnimation('attack');
        } else {
            this.animator.setAnimation('idle');
        }

        super.update(deltaTime);
    }

    changeState() {
        // Simple cycle: IDLE -> ATTACKING -> TELEPORTING -> IDLE
        if (this.state === BossState.IDLE) {
            this.state = BossState.ATTACKING;
            this.stateTimer = 2000; // 2s d'attaque
            this.attack();
        } else if (this.state === BossState.ATTACKING) {
            this.state = BossState.TELEPORTING;
            this.stateTimer = 500; // 0.5s pour téléporter
            this.teleport();
        } else if (this.state === BossState.TELEPORTING) {
            this.state = BossState.IDLE;
            this.stateTimer = 3000; // 3s d'idle
        }
    }

    attack() {
        console.log("Le Démiurge attaque !");
        // Tire 8 projectiles en cercle
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const targetX = this.x + Math.cos(angle) * 100;
            const targetY = this.y + Math.sin(angle) * 100;
            worldManager.projectiles.push(new Projectile(this.x + this.width/2, this.y + this.height/2, targetX, targetY));
        }
    }

    teleport() {
        const room = worldManager.getRoomCoords();
        this.x = room.x + Math.random() * (worldManager.roomWidth - this.width);
        this.y = room.y + Math.random() * (worldManager.roomHeight - this.height);
    }
}

class Ombre extends Enemy {
    constructor(x, y, spriteSheet) {
        super(x, y, spriteSheet);
        this.isVulnerable = false;
        this.speed = 0.5; // Plus lent et erratique
        this.health = 5;

        const animations = {
            'idle_invulnerable': { row: 0, frames: [0, 1, 2, 3], speed: 250 },
            'idle_vulnerable': { row: 1, frames: [0, 1, 2, 3], speed: 250 },
        };
        this.animator = new Animator(this.spriteSheet, 32, 32, animations);
    }

    takeDamage(amount) {
        if (this.isVulnerable) {
            super.takeDamage(amount);
        } else {
            console.log("L'Ombre est invulnérable !");
        }
    }

    update(deltaTime) {
        // Déterminer la vulnérabilité
        const distanceToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (player.isUsingItem && player.currentItem === 'lantern' && distanceToPlayer < 100) {
            this.isVulnerable = true;
            this.animator.setAnimation('idle_vulnerable');
        } else {
            this.isVulnerable = false;
            this.animator.setAnimation('idle_invulnerable');
        }

        // Mouvement simple : suit le joueur s'il est vulnérable
        if (this.isVulnerable) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        }

        super.update(deltaTime);
    }
}

class Sophism extends Enemy {
    constructor(x, y, spriteSheet) {
        super(x, y, spriteSheet);

        // Comportement spécifique : patrouille horizontale
        this.patrolStart = x - 64;
        this.patrolEnd = x + 64;
        this.direction = 1; // 1 pour droite, -1 pour gauche

        const animations = {
            'float': { row: 0, frames: [0, 1, 2, 3], speed: 200 }
        };
        this.animator = new Animator(this.spriteSheet, 32, 32, animations);
        this.animator.setAnimation('float');
    }

    update() {
        super.update(); // Met à jour l'animation

        // Mouvement de patrouille
        this.x += this.speed * this.direction;

        if (this.x > this.patrolEnd) {
            this.x = this.patrolEnd;
            this.direction = -1;
        } else if (this.x < this.patrolStart) {
            this.x = this.patrolStart;
            this.direction = 1;
        }
    }
}
