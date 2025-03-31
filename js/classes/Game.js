import { IsometricWorld } from './IsometricWorld.js';
import { Player } from './Player.js';
import { InputManager } from './InputManager.js';
import { PlantManager } from './PlantManager.js';

export class Game {
    constructor(inventoryManager) {
        // Game constants
        this.GRID_SIZE = 10;
        
        // Game variables
        this.lastTime = 0;
        this.isRunning = false;
        this.score = 0;
        this.harvestedPlants = 0;
        
        // Display elements
        this.infoElement = document.getElementById('info');
        
        // Game managers
        this.inventoryManager = inventoryManager; // Make sure this line exists
        
        // Game objects
        this.world = null;
        this.player = null;
        this.input = null;
        this.plantManager = null;
    }
    
    init() {
        // Create world (handles THREE.js scene, camera, renderer)
        this.world = new IsometricWorld(this.GRID_SIZE);
        this.world.init();
        
        // Create player
        this.player = new Player();
        this.world.addToScene(this.player.mesh);
        
        // Create plant manager
        this.plantManager = new PlantManager(this.world, this.inventoryManager);
        
        // Setup input manager (keyboard and virtual thumbstick)
        this.input = new InputManager();
        this.input.init();
        
        // Handle action button
        this.input.setActionCallback(() => this.performAction());
        
        // Handle window resize
        window.addEventListener('resize', () => this.world.onWindowResize(), false);
        
        // Update info display
        this.updateInfoDisplay();

            // Setup click/tap controls for movement
    this.input.setClickCallback((x, y) => {
        const tileData = this.world.getTileFromScreenPosition(x, y);
        if (tileData) {
            this.movePlayerToTile(tileData.gridX, tileData.gridY);
        }
    });

    }

    movePlayerToTile(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.isMovingToTarget = true;
    }
    
    start() {
        this.isRunning = true;
        this.animate(0);
    }
    
    stop() {
        this.isRunning = false;
    }
    
    animate(time) {
        if (!this.isRunning) return;
        
        requestAnimationFrame((t) => this.animate(t));
        
        const delta = time - this.lastTime;
        this.lastTime = time;
        
        // Update game state
        this.update(delta);
        
        // Render the scene
        this.world.render();
    }
    
    update(delta) {

            // If we're moving to a target position
            if (this.isMovingToTarget) {
                const playerPos = this.player.getGridPosition();
                
                // Calculate direction to target
                const dirX = this.targetX - playerPos.x;
                const dirY = this.targetY - playerPos.y;
                
                // Calculate distance to target
                const distance = Math.sqrt(dirX * dirX + dirY * dirY);
                
                // If we're close enough, stop moving
                if (distance < 0.1) {
                    this.isMovingToTarget = false;
                    return;
                }
                
                // Normalize direction
                const moveSpeed = 2; // Grid squares per second
                const moveAmount = moveSpeed * (delta / 1000);
                
                const normalizedX = dirX / distance;
                const normalizedY = dirY / distance;
                
                // Convert to isometric space
                const dx = (normalizedX - normalizedY) * moveAmount;
                const dy = (normalizedX + normalizedY) * moveAmount / 2;
                
                // Move player
                this.player.move(dx, dy, this.GRID_SIZE);
            } else {// Get input direction
        const direction = this.input.getDirection();
        
        // Move player based on input direction and time delta
        const moveSpeed = 2; // Grid squares per second
        const moveAmount = moveSpeed * (delta / 1000);
        
        let dx = 0;
        let dy = 0;
        
        if (direction.x !== 0 || direction.y !== 0) {
            // Normalize for consistent speed in all directions
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            if (length > 0) {
                const normalizedX = direction.x / length;
                const normalizedY = direction.y / length;
                
                // Convert to isometric space (this is the key fix)
                // For isometric at 45 degrees rotation:
                dx = (normalizedX - normalizedY) * moveAmount;
                dy = (normalizedX + normalizedY) * moveAmount / 2;
            }
        }
        
        // Update player position
        this.player.move(dx, dy, this.GRID_SIZE);
    
    // Update world camera to follow player
    this.world.updateCamera(this.player.position);
    
    // Check for nearby mature plants to harvest
    this.checkForHarvestableNeighbors();
    
    // Update plant growth
    this.plantManager.update(delta);
}
    }

// Add this new method to Game.js
checkForHarvestableNeighbors() {
    // Get current player grid position
    const playerPos = this.player.getGridPosition();
    
    // Check plants in adjacent tiles (including diagonals)
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            // Skip checking the tile the player is standing on
            if (xOffset === 0 && yOffset === 0) continue;
            
            const checkX = playerPos.x + xOffset;
            const checkY = playerPos.y + yOffset;
            
            // Ask plant manager if there's a harvestable plant at this position
            const harvestResult = this.plantManager.harvestIfMature(checkX, checkY);
            
            // Update score if we harvested something
            if (harvestResult && harvestResult.harvested) {
                this.score += 10;
                this.harvestedPlants++;
                this.updateInfoDisplay();
            }
        }
    }
}
    
    performAction() {
        // Get the grid position the player is currently on
        const position = this.player.getGridPosition();
        
        // Get selected seed info from inventory
        const seedInfo = this.inventoryManager ? this.inventoryManager.getSelectedSeedInfo() : null;
        
        console.log("Game - Selected seed info:", seedInfo);
        console.log("Inventory manager reference:", this.inventoryManager);

        // Delegate to plant manager to handle planting/growing/harvesting
        const result = this.plantManager.performAction(position.x, position.y, seedInfo);
        
        // Check if a plant was harvested
        if (result && result.harvested) {
            this.score += 10;
            this.harvestedPlants++;
            this.updateInfoDisplay();
        }
    }
    
    updateInfoDisplay() {
        if (this.infoElement) {
            this.infoElement.innerHTML = `Isometric Farm Game<br>
                                         Plants Harvested: ${this.harvestedPlants}<br>
                                         Score: ${this.score}`;
        }
    }
}