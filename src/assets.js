function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
        img.src = url;
    });
}

function loadJson(url) {
    return fetch(url).then(response => response.json());
}

async function loadAssets(assetList) {
    const assetPromises = [];
    const loadedAssets = {};

    for (const asset of assetList) {
        if (asset.type === 'image') {
            assetPromises.push(
                loadImage(asset.src).then(img => {
                    loadedAssets[asset.name] = img;
                })
            );
        } else if (asset.type === 'json') {
            assetPromises.push(
                loadJson(asset.src).then(json => {
                    loadedAssets[asset.name] = json;
                })
            );
        }
        // On pourra ajouter d'autres types d'assets ici plus tard (sons, etc.)
    }

    await Promise.all(assetPromises);
    return loadedAssets;
}
