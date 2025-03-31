export class InputManager {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            ' ': false // Space
        };
        
        this.joystick = null;
        this.joystickActive = false;
        this.joystickVector = { x: 0, y: 0 };
        
        this.actionCallback = null;
    }
    
    init() {
        this.setupKeyboardControls();
        this.setupTouchControls();
    }
    
    setupKeyboardControls() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (this.keys[e.key] !== undefined) {
                this.keys[e.key] = true;
                
                // Handle space bar (action button) separately
                if (e.key === ' ' && this.actionCallback) {
                    this.actionCallback();
                    this.keys[e.key] = false; // Prevent holding
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (this.keys[e.key] !== undefined) {
                this.keys[e.key] = false;
            }
        });
    }
    
//     setupTouchControls() {
//         // Setup virtual joystick using nippleJS
//         const thumbstickArea = document.getElementById('thumbstick-area');
        
//         if (thumbstickArea) {
//             this.joystick = nipplejs.create({
//                 zone: thumbstickArea,
//                 mode: 'static',
//                 position: { left: '50%', top: '50%' },
//                 color: 'white',
//                 size: 120,
//                 lockX: false,
//                 lockY: false
//             });
            
//             // Joystick events
//             this.joystick.on('start', () => {
//                 this.joystickActive = true;
//             });
            
// // Replace the current joystick 'move' event handler with this:
// this.joystick.on('move', (_, data) => {
//     const angle = data.angle.radian;
//     const force = Math.min(1, data.force);
    
//     // Adjust angle for isometric view (rotate by 45 degrees)
//     const isoAngle = angle - Math.PI / 4;
//     this.joystickVector.x = force * Math.cos(isoAngle);
//     this.joystickVector.y = force * Math.sin(isoAngle);
// });

// // And update this part of getDirection():
// if (this.joystickActive) {
//     dirX = this.joystickVector.x;
//     dirY = -this.joystickVector.y; 
// }

// // Then in getDirection():
// if (this.joystickActive) {
//     dirX = this.joystickVector.x;
//     dirY = -this.joystickVector.y; // Just invert Y for top-down view
// }
            
//             this.joystick.on('end', () => {
//                 this.joystickActive = false;
//                 this.joystickVector.x = 0;
//                 this.joystickVector.y = 0;
//             });
//         }
        
//         // Setup action button for mobile
//         const actionBtn = document.getElementById('action-btn');
//         if (actionBtn && this.actionCallback) {
//             actionBtn.addEventListener('pointerdown', () => {
//                 this.actionCallback();
//             });
//         }
        
//         // Prevent default touch behavior
//         document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
//     }

// In InputManager.js - Add touch/click handling:
setupTouchControls() {
    // Add click/tap event to the renderer
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.addEventListener('click', (e) => {
            if (this.clickCallback) {
                this.clickCallback(e.clientX, e.clientY);
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0 && this.clickCallback) {
                const touch = e.changedTouches[0];
                this.clickCallback(touch.clientX, touch.clientY);
            }
        });
    }
}

setClickCallback(callback) {
    this.clickCallback = callback;
}
    
// In InputManager.js - Update the getDirection method:
getDirection() {
    let dirX = 0;
    let dirY = 0;
    
    // Handle keyboard input
    if (this.keys.ArrowUp || this.keys.w || this.keys.W) dirY -= 1;
    if (this.keys.ArrowDown || this.keys.s || this.keys.S) dirY += 1;
    if (this.keys.ArrowLeft || this.keys.a || this.keys.A) dirX -= 1;
    if (this.keys.ArrowRight || this.keys.d || this.keys.D) dirX += 1;
    
    
    return { x: dirX, y: dirY };
}
    
    setActionCallback(callback) {
        this.actionCallback = callback;
        
        // Update action button event listener if it exists
        const actionBtn = document.getElementById('action-btn');
        if (actionBtn && this.actionCallback) {
            // Remove existing listeners (if any)
            const newActionBtn = actionBtn.cloneNode(true);
            actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
            
            // Add new listener
            newActionBtn.addEventListener('pointerdown', () => {
                this.actionCallback();
            });
        }
    }
}