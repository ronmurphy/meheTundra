export class InventoryManager {
    constructor() {
        this.items = {
            // Starting items
            'carrot_seed': { 
                count: 5, 
                name: 'Carrot Seed', 
                icon: 'eco', 
                type: 'seed',
                plantType: 'carrot'
            },
            'potato_seed': { 
                count: 3, 
                name: 'Potato Seed', 
                icon: 'eco', 
                type: 'seed',
                plantType: 'potato'
            },
            'tomato_seed': { 
                count: 2, 
                name: 'Tomato Seed', 
                icon: 'eco', 
                type: 'seed',
                plantType: 'tomato'
            }
        };
        
        // Track currently selected seed
        this.selectedSeed = 'carrot_seed';
        
        // Container for inventory display
        this.container = document.getElementById('inventory-container');
        
        // Update action button to show what seed is selected
        this.updateActionButton();
    }
    
    // Add an item to inventory
    addItem(itemId, count = 1) {
        if (this.items[itemId]) {
            this.items[itemId].count += count;
        } else {
            // Define new items here
            switch (itemId) {
                case 'carrot':
                    this.items[itemId] = { 
                        count: count, 
                        name: 'Carrot', 
                        icon: 'restaurant', 
                        type: 'crop'
                    };
                    break;
                case 'potato':
                    this.items[itemId] = { 
                        count: count, 
                        name: 'Potato', 
                        icon: 'restaurant', 
                        type: 'crop'
                    };
                    break;
                case 'tomato':
                    this.items[itemId] = { 
                        count: count, 
                        name: 'Tomato', 
                        icon: 'restaurant', 
                        type: 'crop'
                    };
                    break;
                case 'carrot_seed':
                    this.items[itemId] = { 
                        count: count, 
                        name: 'Carrot Seed', 
                        icon: 'eco', 
                        type: 'seed',
                        plantType: 'carrot'
                    };
                    break;
                case 'potato_seed':
                    this.items[itemId] = { 
                        count: count, 
                        name: 'Potato Seed', 
                        icon: 'eco', 
                        type: 'seed',
                        plantType: 'potato'
                    };
                    break;
                case 'tomato_seed':
                    this.items[itemId] = { 
                        count: count, 
                        name: 'Tomato Seed', 
                        icon: 'eco', 
                        type: 'seed',
                        plantType: 'tomato'
                    };
                    break;
                default:
                    console.warn(`Unknown item: ${itemId}`);
                    return false;
            }
        }
        
        // Update display if visible
        this.updateDisplay();
        return true;
    }
    
    // Remove an item from inventory
    removeItem(itemId, count = 1) {
        if (this.items[itemId] && this.items[itemId].count >= count) {
            this.items[itemId].count -= count;
            
            // Remove item completely if count reaches 0
            if (this.items[itemId].count <= 0) {
                delete this.items[itemId];
                
                // If selected seed was removed, select another one
                if (this.selectedSeed === itemId) {
                    this.selectFirstAvailableSeed();
                }
            }
            
            // Update display if visible
            this.updateDisplay();
            // Also update the action button
            this.updateActionButton();
            return true;
        }
        
        return false;
    }
    
    // Get count of a specific item
    getItemCount(itemId) {
        return this.items[itemId] ? this.items[itemId].count : 0;
    }
    
    // Check if we have a specific item
    hasItem(itemId, count = 1) {
        return this.getItemCount(itemId) >= count;
    }
    
    // Get currently selected seed
    getSelectedSeed() {
        // Make sure the selected seed exists, otherwise select first available
        if (!this.items[this.selectedSeed]) {
            this.selectFirstAvailableSeed();
        }
        
        return this.selectedSeed;
    }
    
    // Get info about the selected seed
    getSelectedSeedInfo() {
        const seedId = this.getSelectedSeed();
        return seedId ? this.items[seedId] : null;
    }
    
    // Select a specific seed type
    selectSeed(seedId) {
        if (this.items[seedId] && this.items[seedId].type === 'seed') {
            this.selectedSeed = seedId;
            this.updateDisplay();
            this.updateActionButton();
            
            // Show notification about selected seed
            this.showToast(`Selected: ${this.items[seedId].name}`);
            return true;
        }
        return false;
    }
    
    // Select the first available seed
    selectFirstAvailableSeed() {
        for (const itemId in this.items) {
            if (this.items[itemId].type === 'seed') {
                this.selectedSeed = itemId;
                this.updateActionButton();
                return true;
            }
        }
        
        // No seeds available
        this.selectedSeed = null;
        this.updateActionButton();
        return false;
    }
    
    // Update the action button to show what seed is selected
    updateActionButton() {
        const actionBtn = document.getElementById('action-btn');
        if (!actionBtn) return;
        
        const iconElement = actionBtn.querySelector('.material-icons');
        if (!iconElement) return;
        
        const selectedSeed = this.getSelectedSeedInfo();
        if (selectedSeed) {
            // Update icon to match seed type
            iconElement.textContent = selectedSeed.icon;
            
            // Add seed count next to button
            const countBadge = document.getElementById('seed-count-badge');
            if (countBadge) {
                countBadge.textContent = selectedSeed.count;
            } else {
                // Create count badge if it doesn't exist
                const badge = document.createElement('span');
                badge.id = 'seed-count-badge';
                badge.className = 'seed-count-badge';
                badge.textContent = selectedSeed.count;
                actionBtn.appendChild(badge);
            }
        } else {
            // No seeds available
            iconElement.textContent = 'block';
            
            // Remove count badge if it exists
            const countBadge = document.getElementById('seed-count-badge');
            if (countBadge) {
                countBadge.remove();
            }
        }
    }
    
    // Update the inventory display
    updateDisplay() {
        if (!this.container) return;
        
        // Clear the container
        this.container.innerHTML = '';
        
        // Group items by type
        const seedItems = {};
        const cropItems = {};
        
        // Sort items by type
        for (const itemId in this.items) {
            const item = this.items[itemId];
            if (item.type === 'seed') {
                seedItems[itemId] = item;
            } else if (item.type === 'crop') {
                cropItems[itemId] = item;
            }
        }
        
        // Add section header for seeds
        if (Object.keys(seedItems).length > 0) {
            const seedHeader = document.createElement('div');
            seedHeader.className = 'inventory-header';
            seedHeader.innerHTML = '<h3>Seeds</h3>';
            this.container.appendChild(seedHeader);
            
            // Add seed items
            const seedGrid = document.createElement('div');
            seedGrid.className = 'inventory-grid';
            
            for (const itemId in seedItems) {
                const item = seedItems[itemId];
                const itemElement = this.createItemElement(itemId, item);
                seedGrid.appendChild(itemElement);
            }
            
            this.container.appendChild(seedGrid);
        }
        
        // Add section header for crops
        if (Object.keys(cropItems).length > 0) {
            const cropHeader = document.createElement('div');
            cropHeader.className = 'inventory-header';
            cropHeader.innerHTML = '<h3>Crops</h3>';
            this.container.appendChild(cropHeader);
            
            // Add crop items
            const cropGrid = document.createElement('div');
            cropGrid.className = 'inventory-grid';
            
            for (const itemId in cropItems) {
                const item = cropItems[itemId];
                const itemElement = this.createItemElement(itemId, item);
                cropGrid.appendChild(itemElement);
            }
            
            this.container.appendChild(cropGrid);
        }
        
        // Update the selected seed indicator in the UI
        this.updateSelectedSeedIndicator();
        
        // Update the action button
        this.updateActionButton();
    }
    
    // Create an item element for the inventory
    createItemElement(itemId, item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.dataset.itemId = itemId;
        
        // Add selected class if this is the selected seed
        if (item.type === 'seed' && itemId === this.selectedSeed) {
            itemElement.classList.add('selected');
        }
        
        // Create the item content
        itemElement.innerHTML = `
            <span class="material-icons">${item.icon}</span>
            <span class="item-count">${item.count}</span>
            <span class="item-name">${item.name}</span>
        `;
        
        // Add click handler for seeds to select them
        if (item.type === 'seed') {
            itemElement.addEventListener('click', () => {
                this.selectSeed(itemId);
            });
        }
        
        return itemElement;
    }
    
    // Update the selected seed indicator in the UI
    updateSelectedSeedIndicator() {
        // Find all seed items
        const seedItems = document.querySelectorAll('.inventory-item[data-item-id]');
        
        // Remove selected class from all items
        seedItems.forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selected class to currently selected seed
        if (this.selectedSeed) {
            const selectedItem = document.querySelector(`.inventory-item[data-item-id="${this.selectedSeed}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }
        }
    }
    
    // Show a toast notification
    showToast(message) {
        // Create a toast element if it doesn't exist
        let toast = document.getElementById('inventory-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'inventory-toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set message and show toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}