var EventEmitter2 = EventEmitter2 || require('eventemitter2');

var Character = function() {
    this.x = 0;
    this.y = 0;
    /* up:0, right:1, down:2, left:3 */
    this.direction = 0;
    this.speed = 1;
};
Character.prototype.__proto__ = EventEmitter2.prototype;
 
Character.prototype.tick = function() {
    var mx = 0, my = 0;
    
    switch (this.direction) {
        case 0: my -= 1; break;
        case 1: mx += 1; break;
        case 2: my += 1; break;
        case 3: mx -= 1; break;
    }
    
    // check for wall in front of us
    // if wall - mx = 0, my = 0
    
    // check for warp tile? or just warp when leaving the screen?
    
    this.x += mx;
    this.y += my;
};

Character.prototype.draw = function() {
};

Character.prototype.changeDirection = function(newDir) {
    switch (newDir) {
        case 0:
        case 2:
            if (this.x % 10 === 0) {
                this.direction = newDir;
            }
            break;
        case 1:
        case 3:
            if (this.y % 10 === 0) {
                this.direction = newDir;
            }
            break;
    }
};
