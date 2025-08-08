class Animator {
    constructor(spriteSheet, frameWidth, frameHeight, animations) {
        this.spriteSheet = spriteSheet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.animations = animations; // { 'walk_down': { frames: [0, 1], speed: 200 }, ... }

        this.currentAnimation = null;
        this.currentFrameIndex = 0;
        this.lastFrameTime = 0;
    }

    setAnimation(name) {
        if (this.animations[name] && this.currentAnimation !== this.animations[name]) {
            this.currentAnimation = this.animations[name];
            this.currentFrameIndex = 0;
            this.lastFrameTime = Date.now();
        }
    }

    update() {
        if (!this.currentAnimation) {
            return;
        }

        const now = Date.now();
        if (now - this.lastFrameTime > this.currentAnimation.speed) {
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.currentAnimation.frames.length;
            this.lastFrameTime = now;
        }
    }

    getCurrentFrame() {
        if (!this.currentAnimation) {
            // Retourne une frame par défaut (ex: la première) si aucune animation n'est définie
            return { sx: 0, sy: 0 };
        }

        const frame = this.currentAnimation.frames[this.currentFrameIndex];
        const animationRow = this.currentAnimation.row; // La ligne sur la spritesheet

        const sx = frame * this.frameWidth;
        const sy = animationRow * this.frameHeight;

        return { sx, sy };
    }
}
