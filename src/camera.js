const camera = {
    x: 0,
    y: 0,
    width: 800, // canvas.width
    height: 600, // canvas.height

    // Met à jour la caméra pour la centrer sur le joueur
    update(player, map) {
        // Centre la caméra sur le joueur
        this.x = player.x - this.width / 2 + player.width / 2;
        this.y = player.y - this.height / 2 + player.height / 2;

        // Bloque la caméra aux bords de la carte
        const mapWidthPixels = map.width * map.tilewidth;
        const mapHeightPixels = map.height * map.tileheight;

        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.x + this.width > mapWidthPixels) {
            this.x = mapWidthPixels - this.width;
        }
        if (this.y + this.height > mapHeightPixels) {
            this.y = mapHeightPixels - this.height;
        }
    }
};
