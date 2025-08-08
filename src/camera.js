const camera = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    zoom: 2,

    isTransitioning: false,
    targetX: 0,
    targetY: 0,
    panSpeed: 10, // Vitesse de transition de la caméra

    // Définit la taille logique de la caméra
    setViewport(width, height) {
        this.width = width;
        this.height = height;
    },

    // Positionne la caméra instantanément
    snapTo(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    },

    // Lance une transition vers une nouvelle position
    panTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.isTransitioning = true;
    },

    // Met à jour la position de la caméra (pour les transitions)
    update() {
        if (this.isTransitioning) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;

            // Si on est très proche de la cible, on s'y place directement
            if (Math.abs(dx) < this.panSpeed && Math.abs(dy) < this.panSpeed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.isTransitioning = false;
            } else {
                // Interpolation linéaire simple
                this.x += dx / this.panSpeed;
                this.y += dy / this.panSpeed;
            }
        }
    }
};
