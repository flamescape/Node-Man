var EventEmitter2 = EventEmitter2 || require('eventemitter2');

var Character = function() {
    this.x = 0;
    this.y = 0;
    /* up:0, right:1, down:2, left:3 */
    this.direction = 1;
    this.speed = 15;
};
Character.prototype.__proto__ = EventEmitter2.prototype;
 
Character.prototype.tick = function() {
    var mx = 0, my = 0;
    
    switch (this.direction) {
        case 0: my -= this.speed; break;
        case 1: mx += this.speed; break;
        case 2: my += this.speed; break;
        case 3: mx -= this.speed; break;
    }
    
    // check for wall in front of us
    // if wall - mx = 0, my = 0
    
    // check for warp tile? or just warp when leaving the screen?
    
    this.x += mx;
    this.y += my;
};

Character.prototype.draw = function(tileSize) {
    this.getKineticShape().setAttrs({
        x: (this.x / 100) * tileSize,
        y: (this.y / 100) * tileSize
    });
};

Character.prototype.getKineticShape = function() {
    return this.kineticShape || (this.kineticShape = new Kinetic.Rect({
        width: 24,
        height: 24,
        x: 0,
        y: 0,
        fill: 'white'
    }));
};

Character.prototype.changeDirection = function(newDir) {
    switch (newDir) {
        case 0:
        case 2:
            if (this.x % 100 === 0) {
                this.direction = newDir;
            }
            break;
        case 1:
        case 3:
            if (this.y % 100 === 0) {
                this.direction = newDir;
            }
            break;
    }
};
