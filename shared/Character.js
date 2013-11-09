var EventEmitter2 = EventEmitter2 || require('eventemitter2');

var Character = function(maze) {
    this.maze = maze;
    this.x = 0;
    this.y = 0;
    /* up:1, right:2, down:4, left:8 */
    this.direction = 8;
    this.speed = 0.26;
};
Character.prototype.__proto__ = EventEmitter2.prototype;

Character.prototype.canMove = function(x, y){
    return !this.maze.collisions[(y * this.maze.width) + x];
};

Character.prototype.tick = function() {
    var mx = 0, my = 0;
    
    switch (this.direction) {
        case 1: my -= this.speed; break; // move up
        case 2: mx += this.speed; break; // move right
        case 4: my += this.speed; break; // move down
        case 8: mx -= this.speed; break; // move left
    }
    
    // check for wall in front of us
    // if wall - mx = 0, my = 0
    /*if (!this.canMove(this.x + mx, this.y + my)) {
        mx = 0;
        my = 0;
    }*/
    
    // check for warp tile? or just warp when leaving the screen?
    
    var atNode = (this.x === this.x << 0 && this.y === this.y << 0)
        || (this.y << 0 !== (this.y + my) << 0)
        || (this.x << 0 !== (this.x + mx) << 0)
    ;
    
    if (atNode) {
        // best guess at which node we're standing on
        var mazeX = Math.round(this.x + (mx/2));
        var mazeY = Math.round(this.y + (my/2));
    
        // is this node at a junction? if so, what directions can we go in?
        this.atJunction =
              (this.canMove(mazeX, mazeY - 1) ? 1 : 0) // can go up
            | (this.canMove(mazeX + 1, mazeY) ? 2 : 0) // can go right
            | (this.canMove(mazeX, mazeY + 1) ? 4 : 0) // can go down
            | (this.canMove(mazeX - 1, mazeY) ? 8 : 0) // can go left
        ;
        
        // if we can't move in this direction any longer...
        if (!(this.atJunction & this.direction)) {
            mx = 0;
            my = 0;
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        }
    }
    
    this.x += mx;
    this.y += my;
    
    if (this.atJunction) {
        this.emit('atJunction', this.atJunction);
        this.atJunction = 0;
    }
};

Character.prototype.assignController = function(controller) {
    this.controller = controller;
};

Character.prototype.draw = function(tileSize) {
    this.getKineticShape().setAttrs({
        x: this.x * tileSize,
        y: this.y * tileSize
    });
};

Character.prototype.getKineticShape = function() {
    return this.kineticShape || (this.kineticShape = new Kinetic.Rect({
        width: 40,
        height: 40,
        x: 0,
        y: 0,
        offsetX: 8,
        offsetY: 8,
        fill: 'white'
    }));
};

Character.prototype.changeDirection = function(newDir) {
    switch (newDir) {
        case 1:
        case 4:
            if (this.atJunction) {
                this.x = Math.round(this.x);
            }
            if (this.x === this.x << 0) {
                this.direction = newDir;
            }
            break;
        case 2:
        case 8:
            if (this.atJunction) {
                this.y = Math.round(this.y);
            }
            if (this.y === this.y << 0) {
                this.direction = newDir;
            }
            break;
    }
};
