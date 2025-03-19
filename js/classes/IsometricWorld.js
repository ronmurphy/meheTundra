import { GridTile } from './GridTile.js';

export class IsometricWorld {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gridTiles = [];
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLighting();
        this.createGrid();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
    }
    
    createCamera() {
        // Create a camera with isometric perspective
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -5 * aspect, 5 * aspect, 5, -5, 0.1, 1000
        );
        
        // Position for isometric view
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
        document.body.appendChild(this.renderer.domElement);
    }
    
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    createGrid() {
        // Create a grid of tiles
        for (let x = -this.gridSize / 2; x < this.gridSize / 2; x++) {
            for (let z = -this.gridSize / 2; z < this.gridSize / 2; z++) {
                // Create a new tile
                const isEven = (x + z) % 2 === 0;
                const tileColor = isEven ? 0x8B4513 : 0xA0522D; // Brown colors for soil
                
                const tile = new GridTile(x, z, tileColor);
                this.scene.add(tile.mesh);
                
                // Store reference to the tile
                this.gridTiles.push(tile);
            }
        }
    }
    
    addToScene(object) {
        this.scene.add(object);
    }
    
    removeFromScene(object) {
        this.scene.remove(object);
    }
    
    updateCamera(targetPosition) {
        // Update camera to follow target
        const cameraTarget = new THREE.Vector3(
            targetPosition.x,
            0,
            targetPosition.y
        );
        this.camera.lookAt(cameraTarget);
    }
    
    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = -5 * aspect;
        this.camera.right = 5 * aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    // Helper method to find a tile at a specific grid position
    getTileAt(gridX, gridY) {
        return this.gridTiles.find(tile => 
            tile.gridX === gridX && tile.gridY === gridY
        );
    }
}