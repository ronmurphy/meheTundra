import { Game } from './classes/Game.js';
import { InventoryManager } from './classes/InventoryManager.js';

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Shoelace components to be defined
    customElements.whenDefined('sl-dialog').then(() => {
        // Create inventory manager
        const inventoryManager = new InventoryManager();

        // Create and start the game
        const game = new Game(inventoryManager);
        game.init();
        game.start();

        // Handle instructions dialog
        const instructionsDialog = document.getElementById('game-instructions');
        const closeButton = document.getElementById('close-instructions');

        // Show instructions on first load
        instructionsDialog.show();

        if (closeButton && instructionsDialog) {
            closeButton.addEventListener('click', () => {
                instructionsDialog.hide();
            });
        }

        // Handle inventory drawer
        const inventoryDrawer = document.getElementById('inventory-drawer');
        const openInventoryBtn = document.getElementById('open-inventory');
        const closeInventoryBtn = document.getElementById('close-inventory');

        if (openInventoryBtn && inventoryDrawer) {
            openInventoryBtn.addEventListener('click', () => {
                // Update inventory display before showing
                inventoryManager.updateDisplay();
                inventoryDrawer.show();
            });
        }

        if (closeInventoryBtn && inventoryDrawer) {
            closeInventoryBtn.addEventListener('click', () => {
                inventoryDrawer.hide();
                console.log("Current selected seed: ", inventoryManager.getSelectedSeed());
                console.log("Current selected seed info: ", inventoryManager.getSelectedSeedInfo());
            });
        }
    });
});