import { Plant } from './Plant.js';
import { Notification } from './Notification.js';

export class PlantManager {
    constructor(world, inventoryManager) {
        this.world = world;
        this.inventoryManager = inventoryManager;
        this.plants = {}; // Store plants by grid position string
        this.plantTimers = {}; // Store growth timers by grid position
        this.plantTypes = {}; // Store plant types by grid position
        this.growthTime = 15000; // Time in ms between each growth stage (15 seconds)
    }
    
    update(deltaTime) {
        // Nothing to do if no plants
        if (Object.keys(this.plants).length === 0) return;
        
        // Check each plant for growth
        for (const gridKey in this.plants) {
            const plant = this.plants[gridKey];
            
            // Skip fully grown plants
            if (plant.growthStage >= 3) continue;
            
            // Initialize timer if not exists
            if (!this.plantTimers[gridKey]) {
                this.plantTimers[gridKey] = 0;
            }
            
            // Increment timer
            this.plantTimers[gridKey] += deltaTime;
            
            // Check if it's time to grow
            if (this.plantTimers[gridKey] >= this.growthTime) {
                // Reset timer
                this.plantTimers[gridKey] = 0;
                
                // Get coordinates from grid key
                const [gridX, gridY] = gridKey.split(',').map(Number);
                
                // Grow the plant
                this.growPlant(gridX, gridY, true);
            }
        }
    }
    
// Perform action at a specific grid position (plant/grow/harvest)
performAction(gridX, gridY, seedInfo) {
    const gridKey = `${gridX},${gridY}`;
    const result = { harvested: false };
    
    if (this.plants[gridKey]) {
        // Plant exists at this position
        const plant = this.plants[gridKey];
        
        if (plant.growthStage === 3) {
            // Harvest if fully grown
            this.harvestPlant(gridX, gridY);
            result.harvested = true;
        } else {
            // Water/grow the plant
            this.growPlant(gridX, gridY);
        }
    } else {
        // Plant a new seed if we have one selected
        if (seedInfo && this.inventoryManager.hasItem(seedInfo.plantType + '_seed')) {
            this.plantSeed(gridX, gridY, seedInfo.plantType);
            // Remove one seed from inventory
            this.inventoryManager.removeItem(seedInfo.plantType + '_seed', 1);
        } else {
            // Show notification that we need seeds
            this.showNotification(gridX, gridY, "Need seeds! 🌱", 0xFF0000);
        }
    }
    
    return result;
}
    
    plantSeed(gridX, gridY, plantType = 'carrot') {
        console.log("Planting seed type:", plantType);
        console.log("Available seeds:", this.inventoryManager.items);
        const gridKey = `${gridX},${gridY}`;
        
        // Create new plant at growth stage 0 (seed)
        const plant = new Plant(0, plantType);
        plant.mesh.position.set(gridX, 0, gridY);
        
        // Add to scene and store reference
        this.world.addToScene(plant.mesh);
        this.plants[gridKey] = plant;
        this.plantTypes[gridKey] = plantType;
        
        // Initialize growth timer
        this.plantTimers[gridKey] = 0;
        
        // Show planting notification
        this.showNotification(gridX, gridY, "Planted! 🌱", 0x8B4513);
    }
    
    growPlant(gridX, gridY, isAutoGrowth = false) {
        const gridKey = `${gridX},${gridY}`;
        const existingPlant = this.plants[gridKey];
        const plantType = this.plantTypes[gridKey] || 'carrot';
        
        if (!existingPlant) return;
        
        // Remove the existing plant from the scene
        this.world.removeFromScene(existingPlant.mesh);
        
        // Create a new plant with the next growth stage
        const newGrowthStage = Math.min(3, existingPlant.growthStage + 1);
        const newPlant = new Plant(newGrowthStage, plantType);
        newPlant.mesh.position.set(gridX, 0, gridY);
        
        // Add to scene and update reference
        this.world.addToScene(newPlant.mesh);
        this.plants[gridKey] = newPlant;
        
        // Show growth notification
        if (isAutoGrowth) {
            // Show growth notification for automatic growth
            let message;
            let color;
            
            switch (newGrowthStage) {
                case 1:
                    message = "Growing! 🌿";
                    color = 0x32CD32; // Lime green
                    break;
                case 2:
                    message = "Blooming! 🌿";
                    color = 0x228B22; // Forest green
                    break;
                case 3:
                    message = "Ready to harvest! 🌽";
                    color = 0xFFD700; // Gold
                    break;
            }
            
            this.showNotification(gridX, gridY, message, color);
        } else {
            // Show watering notification for manual interaction
            this.showNotification(gridX, gridY, "Watered! 💧", 0x4682B4);
        }
    }
    
    harvestPlant(gridX, gridY) {
        const gridKey = `${gridX},${gridY}`;
        const plant = this.plants[gridKey];
        const plantType = this.plantTypes[gridKey] || 'carrot';
        
        if (!plant) return;
        
        // Remove from scene and delete reference
        this.world.removeFromScene(plant.mesh);
        delete this.plants[gridKey];
        delete this.plantTimers[gridKey];
        delete this.plantTypes[gridKey];
        
        // Show harvesting notification
        this.showNotification(gridX, gridY, "Harvested! 🌽", 0xFF6347);
        
        // Add harvested crop to inventory
        if (this.inventoryManager) {
            this.inventoryManager.addItem(plantType, 1);
            
            // Sometimes get seeds back (50% chance)
            if (Math.random() > 0.5) {
                this.inventoryManager.addItem(plantType + '_seed', 1);
                this.showNotification(gridX, gridY, "+1 Seed!", 0x32CD32);
            }
        }
    }

    // Add to PlantManager.js
harvestIfMature(gridX, gridY) {
    const gridKey = `${gridX},${gridY}`;
    const plant = this.plants[gridKey];
    
    // Check if there's a mature plant at this position
    if (plant && plant.growthStage === 3) {
        // Harvest the plant
        this.harvestPlant(gridX, gridY);
        return { harvested: true };
    }
    
    return { harvested: false };
}
    
    showNotification(gridX, gridY, message, color) {
        // Create a notification that floats upward
        const notification = new Notification(message, color);
        notification.mesh.position.set(gridX, 0.5, gridY);
        
        // Add to scene
        this.world.addToScene(notification.mesh);
        
        // Animate and remove after animation completes
        notification.animate(() => {
            this.world.removeFromScene(notification.mesh);
        });
    }
}