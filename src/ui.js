const dialogueManager = {
    isActive: false,
    onChoice: null,

    show(config) { // config: { text: string, choices: [{text: string, value: any}] }
        if (this.isActive) return;
        this.isActive = true;

        // Mettre le jeu en pause (simple flag, géré dans main.js)
        console.log("Dialogue ouvert, jeu en pause.");

        const uiContainer = document.getElementById('ui-container');

        const box = document.createElement('div');
        box.className = 'dialogue-box';

        const textP = document.createElement('p');
        textP.textContent = config.text;
        box.appendChild(textP);

        if (config.choices) {
            const choiceContainer = document.createElement('div');
            config.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.onclick = () => {
                    if (this.onChoice) {
                        this.onChoice(choice.value);
                    }
                    this.hide();
                };
                choiceContainer.appendChild(button);
            });
            box.appendChild(choiceContainer);
        } else {
            // Si pas de choix, fermer au clic
            box.onclick = () => this.hide();
        }

        uiContainer.appendChild(box);
    },

    hide() {
        if (!this.isActive) return;

        const uiContainer = document.getElementById('ui-container');
        uiContainer.innerHTML = ''; // Nettoyer

        this.isActive = false;
        this.onChoice = null;
        console.log("Dialogue fermé, reprise du jeu.");
    },

    startDialogue(config, callback) {
        this.onChoice = callback;
        this.show(config);
    }
};
