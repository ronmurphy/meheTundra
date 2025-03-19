export class Plant {
    constructor(growthStage = 0, plantType = 'carrot') {
        this.growthStage = growthStage; // 0: seed, 1: sprout, 2: growing, 3: mature
        this.plantType = plantType; // carrot, potato, tomato, etc.
        this.mesh = this.createPlantMesh(growthStage, plantType);
    }
    
    createPlantMesh(growthStage, plantType) {
        const plantGroup = new THREE.Group();
        
        // Base/soil
        const baseGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x3D2817 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.05;
        plantGroup.add(base);
        
        // Plant based on growth stage (0-3) and type
        if (growthStage > 0) {
            const stemHeight = 0.1 + (growthStage * 0.1);
            
            // Stem color varies by plant type
            let stemColor = 0x228B22; // Default green
            switch (plantType) {
                case 'carrot':
                    stemColor = 0x228B22; // Green
                    break;
                case 'potato':
                    stemColor = 0x32CD32; // Lighter green
                    break;
                case 'tomato':
                    stemColor = 0x006400; // Dark green
                    break;
            }
            
            const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, stemHeight, 8);
            const stemMaterial = new THREE.MeshStandardMaterial({ color: stemColor });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.1 + (stemHeight / 2);
            plantGroup.add(stem);
            
            if (growthStage > 1) {
                // Add leaves
                const leafSize = 0.05 + (growthStage * 0.03);
                const leafGeometry = new THREE.SphereGeometry(leafSize, 8, 8);
                
                // Leaf color varies by plant type
                let leafColor = 0x32CD32; // Default lime green
                switch (plantType) {
                    case 'carrot':
                        leafColor = 0x32CD32; // Lime green
                        break;
                    case 'potato':
                        leafColor = 0x228B22; // Forest green
                        break;
                    case 'tomato':
                        leafColor = 0x006400; // Dark green
                        break;
                }
                
                const leafMaterial = new THREE.MeshStandardMaterial({ color: leafColor });
                
                const leaf1 = new THREE.Mesh(leafGeometry, leafMaterial);
                leaf1.position.set(0.1, 0.15 + (growthStage * 0.05), 0);
                leaf1.scale.set(1.5, 0.5, 1);
                plantGroup.add(leaf1);
                
                const leaf2 = new THREE.Mesh(leafGeometry, leafMaterial);
                leaf2.position.set(-0.1, 0.17 + (growthStage * 0.05), 0);
                leaf2.scale.set(1.5, 0.5, 1);
                plantGroup.add(leaf2);
                
                if (growthStage > 2) {
                    // Add fruit/flower when fully grown - varies by plant type
                    let fruitGeometry;
                    let fruitColor;
                    
                    switch (plantType) {
                        case 'carrot':
                            // Orange carrot
                            fruitGeometry = new THREE.ConeGeometry(0.08, 0.2, 8);
                            fruitColor = 0xFF8C00;
                            break;
                        case 'potato':
                            // Brown potato
                            fruitGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                            fruitColor = 0x8B4513;
                            break;
                        case 'tomato':
                            // Red tomato
                            fruitGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                            fruitColor = 0xFF0000;
                            break;
                        default:
                            // Default fruit
                            fruitGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                            fruitColor = 0xFF6347;
                    }
                    
                    const fruitMaterial = new THREE.MeshStandardMaterial({ color: fruitColor });
                    const fruit = new THREE.Mesh(fruitGeometry, fruitMaterial);
                    
                    if (plantType === 'carrot') {
                        // Rotate carrot to point downward
                        fruit.rotation.x = Math.PI;
                        fruit.position.y = 0.3;
                    } else {
                        fruit.position.y = 0.3 + (growthStage * 0.05);
                    }
                    
                    plantGroup.add(fruit);
                }
            }
        }
        
        return plantGroup;
    }
}