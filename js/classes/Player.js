export class Player {
    constructor() {
        this.position = { x: 0, y: 0 }; // Grid position
        this.mesh = this.createPlayerMesh();
    }
    
    createPlayerMesh() {
        const playerGroup = new THREE.Group();
        
        // Basic player body
        const bodyGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3366FF });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        playerGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.9;
        playerGroup.add(head);
        
        // Position the player mesh
        playerGroup.position.set(this.position.x, 0.5, this.position.y);
        
        return playerGroup;
    }
    
    move(dx, dy, gridSize) {
        // Update position based on direction
        this.position.x += dx;
        this.position.y += dy;
        
        // Constrain to grid boundaries
        const halfGrid = gridSize / 2;
        this.position.x = Math.max(-halfGrid, Math.min(halfGrid - 1, this.position.x));
        this.position.y = Math.max(-halfGrid, Math.min(halfGrid - 1, this.position.y));
        
        // Update mesh position
        this.updateMeshPosition();
    }
    
    updateMeshPosition() {
        // Update the 3D model position to match the logical position
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.y;
        this.mesh.position.y = 0.5; // Height above the ground
    }
    
    getGridPosition() {
        // Return the current grid position as integer coordinates
        return {
            x: Math.round(this.position.x),
            y: Math.round(this.position.y)
        };
    }
}