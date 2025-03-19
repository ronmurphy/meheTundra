export class GridTile {
    constructor(gridX, gridY, color) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.color = color;
        this.mesh = this.createTileMesh();
    }
    
    createTileMesh() {
        const tileGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        const tileMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const tileMesh = new THREE.Mesh(tileGeometry, tileMaterial);
        
        // Position tile in the grid
        tileMesh.position.set(this.gridX, 0, this.gridY);
        
        // Store grid position in userData for raycasting later
        tileMesh.userData = { 
            type: 'tile', 
            gridX: this.gridX, 
            gridY: this.gridY 
        };
        
        return tileMesh;
    }
}