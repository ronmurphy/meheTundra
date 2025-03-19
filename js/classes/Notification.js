export class Notification {
    constructor(text, color = 0xFFFFFF) {
        this.text = text;
        this.color = color;
        this.mesh = this.createNotificationMesh();
        this.duration = 1500; // Duration of animation in ms
    }
    
    createNotificationMesh() {
        // Create a group to hold the text
        const group = new THREE.Group();
        
        // Create the text sprite
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        // Draw background with rounded corners
        context.fillStyle = this.hexToRgba(this.color, 0.7);
        this.roundRect(context, 10, 10, canvas.width - 20, canvas.height - 20, 10);
        context.fill();
        
        // Draw text
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#FFFFFF';
        context.fillText(this.text, canvas.width / 2, canvas.height / 2);
        
        // Create sprite from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            depthTest: false
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.5, 0.75, 1);
        group.add(sprite);
        
        return group;
    }
    
    animate(onComplete) {
        const startTime = Date.now();
        const startY = this.mesh.position.y;
        const targetY = startY + 2; // Float up 2 units
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            
            // Update position - float upward
            this.mesh.position.y = startY + (targetY - startY) * progress;
            
            // Update opacity - fade out near the end
            const opacity = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;
            this.mesh.children[0].material.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }
    
    // Helper function to draw rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    // Helper function to convert hex color to rgba
    hexToRgba(hex, alpha = 1) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}