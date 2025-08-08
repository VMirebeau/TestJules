const worldManager = {
    currentMap: null,
    currentTileset: null,
    enemies: [],
    projectiles: [],
    interactiveObjects: [],

    roomWidth: 0,
    roomHeight: 0,
    currentRoomX: 0,
    currentRoomY: 0,

    async loadMap(mapData, player, initialRoomX = 0, initialRoomY = 0) {
        this.currentMap = mapData;
        this.currentTileset = window.globalGameAssets[mapData.tilesetName];

        this.roomWidth = camera.width;
        this.roomHeight = camera.height;
        this.currentRoomX = initialRoomX;
        this.currentRoomY = initialRoomY;

        camera.snapTo(this.currentRoomX * this.roomWidth, this.currentRoomY * this.roomHeight);

        this.spawnEntities();
        return true;
    },

    spawnEntities() {
        this.enemies = [];
        this.projectiles = [];
        this.interactiveObjects = [];
        const objectLayers = this.currentMap.layers.filter(l => l.type === 'objectgroup');

        for(const layer of objectLayers) {
            for (const obj of layer.objects) {
                const objRoomX = Math.floor(obj.x / this.roomWidth);
                const objRoomY = Math.floor(obj.y / this.roomHeight);

                if (objRoomX === this.currentRoomX && objRoomY === this.currentRoomY) {
                    if (layer.name === 'objects') {
                        switch (obj.type) {
                            case 'Sophism': this.enemies.push(new Sophism(obj.x, obj.y, window.globalGameAssets.sophismSheet)); break;
                            case 'Ombre': this.enemies.push(new Ombre(obj.x, obj.y, window.globalGameAssets.ombreSheet)); break;
                            case 'Demiurge': this.enemies.push(new Demiurge(obj.x, obj.y, window.globalGameAssets.demiurgeSheet)); break;
                        }
                    } else if (layer.name === 'interactive') {
                        this.interactiveObjects.push(obj);
                    }
                }
            }
        }
    },

    getRoomCoords() {
        return {
            x: this.currentRoomX * this.roomWidth,
            y: this.currentRoomY * this.roomHeight
        };
    },

    checkForRoomTransition(player) {
        if (camera.isTransitioning) return;
        let newRoomX = this.currentRoomX, newRoomY = this.currentRoomY;
        const p_cx = player.x + player.width / 2;
        const p_cy = player.y + player.height / 2;

        if (p_cx > (this.currentRoomX + 1) * this.roomWidth) { newRoomX++; player.x += player.width; }
        else if (p_cx < this.currentRoomX * this.roomWidth) { newRoomX--; player.x -= player.width; }
        else if (p_cy > (this.currentRoomY + 1) * this.roomHeight) { newRoomY++; player.y += player.height; }
        else if (p_cy < this.currentRoomY * this.roomHeight) { newRoomY--; player.y -= player.height; }

        if (newRoomX !== this.currentRoomX || newRoomY !== this.currentRoomY) {
            this.currentRoomX = newRoomX;
            this.currentRoomY = newRoomY;
            camera.panTo(this.currentRoomX * this.roomWidth, this.currentRoomY * this.roomHeight);
            this.spawnEntities();
        }
    },

    updateTile(tileX, tileY, newTileIndex) {
        const bgLayer = this.currentMap.layers.find(l => l.name === 'background');
        const colLayer = this.currentMap.layers.find(l => l.name === 'collision');
        const mapWidth = this.currentMap.width;
        const index = tileY * mapWidth + tileX;
        bgLayer.data[index] = newTileIndex;
        colLayer.data[index] = (newTileIndex === 1 || newTileIndex === 2) ? 1 : 0;
    },

    update(deltaTime) {
        if (!this.currentMap) return;
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.projectiles.forEach(p => p.update(deltaTime));
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
        this.projectiles = this.projectiles.filter(p => p.isAlive);
    },

    draw() {
        if (this.currentMap && this.currentTileset) {
            drawMap(this.currentMap, this.currentTileset, camera);
        }
        this.enemies.forEach(enemy => enemy.draw());
        this.projectiles.forEach(p => p.draw());
    },

    isSolid(x, y) {
        if (!this.currentMap) return true;
        return isSolidTile(x, y, this.currentMap);
    }
};
