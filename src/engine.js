function drawMap(mapData, tileset, camera) {
    const { tilewidth, tileheight, width, layers } = mapData;
    const backgroundLayer = layers.find(layer => layer.name === 'background');

    if (!backgroundLayer) {
        console.error("Couche 'background' non trouvée dans la carte !");
        return;
    }

    // Calculer la plage de tuiles visibles
    const startCol = Math.floor(camera.x / tilewidth);
    const endCol = Math.ceil((camera.x + camera.width) / tilewidth);
    const startRow = Math.floor(camera.y / tileheight);
    const endRow = Math.ceil((camera.y + camera.height) / tileheight);

    for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
            // S'assurer qu'on ne dessine pas en dehors des limites de la carte
            if (x < 0 || x >= width || y < 0 || y >= mapData.height) {
                continue;
            }

            const tileIndex = y * width + x;
            const tileValue = backgroundLayer.data[tileIndex];

            if (tileValue === -1) {
                continue;
            }

            const canvasX = x * tilewidth;
            const canvasY = y * tileheight;

            // Position de la tuile dans le tileset (en pixels)
            const tilesetX = (tileValue % (tileset.width / tilewidth)) * tilewidth;
            const tilesetY = Math.floor(tileValue / (tileset.width / tilewidth)) * tileheight;

            ctx.drawImage(
                tileset,      // L'image du tileset
                tilesetX,     // Coordonnée X de la tuile source
                tilesetY,     // Coordonnée Y de la tuile source
                tilewidth,    // Largeur de la tuile source
                tileheight,   // Hauteur de la tuile source
                canvasX,      // Coordonnée X de destination sur le canvas
                canvasY,      // Coordonnée Y de destination sur le canvas
                tilewidth,    // Largeur de la tuile de destination
                tileheight    // Hauteur de la tuile de destination
            );
        }
    }
}

function isSolidTile(x, y, mapData) {
    const { tilewidth, tileheight, width, layers } = mapData;
    const collisionLayer = layers.find(layer => layer.name === 'collision');

    if (!collisionLayer) {
        return false; // Par défaut, rien n'est solide si la couche n'existe pas
    }

    const tileX = Math.floor(x / tilewidth);
    const tileY = Math.floor(y / tileheight);

    // Vérifier si on est en dehors de la carte
    if (tileX < 0 || tileX >= width || tileY < 0 || tileY >= mapData.height) {
        return true; // Considérer les zones hors carte comme solides
    }

    const tileIndex = tileY * width + tileX;
    const collisionValue = collisionLayer.data[tileIndex];

    return collisionValue === 1;
}
