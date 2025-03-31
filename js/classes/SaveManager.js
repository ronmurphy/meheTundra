// SaveManager.js - Handles all save/load functionality

export class SaveManager {
    constructor() {
        this.SAVE_PREFIX = 'isometric_farm_';
        this.currentSaveId = null;
    }
    
    /**
     * Generate a unique save ID based on character name and timestamp
     * @param {string} characterName - Name of the character
     * @returns {string} - Unique save ID
     */
    generateSaveId(characterName) {
        const timestamp = Date.now();
        const sanitizedName = characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        return `${sanitizedName}_${timestamp}`;
    }
    
    /**
     * Save the game state
     * @param {Object} gameState - Current game state to save
     * @returns {boolean} - Success or failure
     */
    saveGame(gameState) {
        try {
            // If it's a new character, generate a save ID
            if (!this.currentSaveId) {
                this.currentSaveId = this.generateSaveId(gameState.character.name);
                gameState.saveId = this.currentSaveId;
            }
            
            const saveKey = `${this.SAVE_PREFIX}${this.currentSaveId}`;
            
            // Add timestamp to track last save
            gameState.lastSaved = Date.now();
            
            // Save to localStorage
            localStorage.setItem(saveKey, JSON.stringify(gameState));
            
            // Also save to the save index
            this.updateSaveIndex(gameState);
            
            console.log(`Game saved successfully with ID: ${this.currentSaveId}`);
            return true;
        } catch (error) {
            console.error("Failed to save game:", error);
            return false;
        }
    }
    
    /**
     * Load a saved game
     * @param {string} saveId - ID of the save to load
     * @returns {Object|null} - Loaded game state or null if failed
     */
    loadGame(saveId) {
        try {
            const saveKey = `${this.SAVE_PREFIX}${saveId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) {
                console.error(`No save found with ID: ${saveId}`);
                return null;
            }
            
            const gameState = JSON.parse(savedData);
            this.currentSaveId = saveId;
            
            console.log(`Game loaded successfully with ID: ${saveId}`);
            return gameState;
        } catch (error) {
            console.error("Failed to load game:", error);
            return null;
        }
    }
    
    /**
     * Delete a saved game
     * @param {string} saveId - ID of the save to delete
     * @returns {boolean} - Success or failure
     */
    deleteSave(saveId) {
        try {
            const saveKey = `${this.SAVE_PREFIX}${saveId}`;
            
            // Remove from localStorage
            localStorage.removeItem(saveKey);
            
            // Remove from save index
            const saveIndex = this.getSaveIndex();
            const updatedIndex = saveIndex.filter(save => save.saveId !== saveId);
            this.saveSaveIndex(updatedIndex);
            
            console.log(`Save deleted successfully with ID: ${saveId}`);
            
            // Reset current save ID if we deleted the active save
            if (this.currentSaveId === saveId) {
                this.currentSaveId = null;
            }
            
            return true;
        } catch (error) {
            console.error("Failed to delete save:", error);
            return false;
        }
    }
    
    /**
     * Get all saved games as an array
     * @returns {Array} - Array of save metadata objects
     */
    getAllSaves() {
        return this.getSaveIndex();
    }
    
    /**
     * Save index is a separate record containing metadata about all saves
     * This allows us to show the save selection screen without loading all saves
     */
    getSaveIndex() {
        try {
            const indexData = localStorage.getItem(`${this.SAVE_PREFIX}index`);
            return indexData ? JSON.parse(indexData) : [];
        } catch (error) {
            console.error("Failed to get save index:", error);
            return [];
        }
    }
    
    /**
     * Save the save index
     * @param {Array} index - Array of save metadata 
     */
    saveSaveIndex(index) {
        try {
            localStorage.setItem(`${this.SAVE_PREFIX}index`, JSON.stringify(index));
        } catch (error) {
            console.error("Failed to update save index:", error);
        }
    }
    
    /**
     * Update the save index with the latest game state
     * @param {Object} gameState - Current game state
     */
    updateSaveIndex(gameState) {
        const saveIndex = this.getSaveIndex();
        
        // Create save metadata
        const saveMetadata = {
            saveId: this.currentSaveId,
            characterName: gameState.character.name,
            farmName: gameState.character.farmName,
            level: gameState.character.level || 1,
            daysPassed: gameState.daysPassed || 0,
            lastSaved: gameState.lastSaved,
            // Include appearance data for character preview
            appearance: gameState.character.appearance,
            // Include a thumbnail of the farm if desired
            // thumbnail: gameState.thumbnail
        };
        
        // Check if this save already exists in the index
        const existingIndex = saveIndex.findIndex(save => save.saveId === this.currentSaveId);
        
        if (existingIndex >= 0) {
            // Update existing save metadata
            saveIndex[existingIndex] = saveMetadata;
        } else {
            // Add new save metadata
            saveIndex.push(saveMetadata);
        }
        
        // Save updated index
        this.saveSaveIndex(saveIndex);
    }
    
    /**
     * Create a new character and initialize game state
     * @param {Object} characterData - Character creation data
     * @returns {Object} - Initial game state
     */
    createNewGame(characterData) {
        // Initialize a new game state with the character data
        const gameState = {
            character: {
                name: characterData.name,
                farmName: characterData.farmName,
                gender: characterData.gender,
                appearance: characterData.appearance,
                level: 1,
                experience: 0,
                energy: 100,
                maxEnergy: 100,
                money: 500, // Starting cash
            },
            inventory: {
                items: {
                    'carrot_seed': { count: 5 },
                    'potato_seed': { count: 3 },
                    'tomato_seed': { count: 2 },
                    'watering_can': { count: 1 },
                    'hoe': { count: 1 }
                },
                selectedSeed: 'carrot_seed'
            },
            farm: {
                plots: [], // Will be initialized with starting plots
                unlocked: [[0,0], [0,1], [1,0], [1,1]], // Starting 2x2 farm area
                size: 10, // Total available farm size (for expansion)
            },
            daysPassed: 0,
            time: {
                hour: 6, // Start at 6 AM
                minute: 0,
                day: 1,
                season: 'spring',
                year: 1
            },
            stats: {
                plantsHarvested: 0,
                plantsPlanted: 0,
                moneyEarned: 0,
                moneySpent: 0
            }
        };
        
        // Generate a save ID and save the initial game state
        this.currentSaveId = this.generateSaveId(characterData.name);
        gameState.saveId = this.currentSaveId;
        this.saveGame(gameState);
        
        return gameState;
    }
    
    /**
     * Check if any saves exist
     * @returns {boolean} - True if saves exist, false otherwise
     */
    hasSaves() {
        const saveIndex = this.getSaveIndex();
        return saveIndex.length > 0;
    }
    
    /**
     * Export save data (for backup or transfer)
     * @param {string} saveId - ID of the save to export
     * @returns {string|null} - JSON string of the save data
     */
    exportSave(saveId) {
        try {
            const saveData = this.loadGame(saveId);
            if (!saveData) return null;
            
            return JSON.stringify(saveData);
        } catch (error) {
            console.error("Failed to export save:", error);
            return null;
        }
    }
    
    /**
     * Import save data
     * @param {string} saveData - JSON string of the save data
     * @returns {boolean} - Success or failure
     */
    importSave(saveData) {
        try {
            const gameState = JSON.parse(saveData);
            
            // Validate that this is a proper save file
            if (!gameState.character || !gameState.character.name) {
                console.error("Invalid save data");
                return false;
            }
            
            // Generate a new save ID to avoid conflicts
            const oldSaveId = gameState.saveId;
            gameState.saveId = this.generateSaveId(gameState.character.name);
            this.currentSaveId = gameState.saveId;
            
            // Save the imported game
            this.saveGame(gameState);
            
            console.log(`Save imported successfully. Old ID: ${oldSaveId}, New ID: ${gameState.saveId}`);
            return true;
        } catch (error) {
            console.error("Failed to import save:", error);
            return false;
        }
    }
}