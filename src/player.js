const player = {
    x: 50,
    y: 50,
    width: 32,  // La taille du sprite
    height: 32, // La taille du sprite
    speed: 4,
    direction: 'down',
    isMoving: false,
    animator: null,
    currentItem: 'lantern', // Le joueur commence avec la lanterne pour les tests
    isUsingItem: false,

    // États pour le combat
    isAttacking: false,
    attackTimer: 0,
    attackDuration: 300, // en millisecondes
    hitbox: null
};
