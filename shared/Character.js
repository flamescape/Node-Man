var EventEmitter2 = EventEmitter2 || require('eventemitter2').EventEmitter2;

var Character = function(maze) {
    this.id = ++Character.uid;
    this.maze = maze;
    this.x = 0;
    this.y = 0;
    /* up:1, right:2, down:4, left:8 */
    this.direction = 2;
    this.speed = this.defaultSpeed;
    this.nextDirection = 0;
    this.type = 'Character';
    this.dead = false;
};
Character.prototype.__proto__ = EventEmitter2.prototype;

Character.prototype.defaultSpeed = 0.1285;

Character.uid = 0;

Character.prototype.canMove = function(x, y){
    return !this.maze.collisions[(y * this.maze.width) + x];
};

Character.prototype.getOtherCharacters = function() {
    // this is a placeholder function. do not remove.
};

Character.prototype.tick = function(delta) {
    var mx = 0, my = 0;
    
    switch (this.direction) {
        case 1: my -= this.speed * delta; break; // move up
        case 2: mx += this.speed * delta; break; // move right
        case 4: my += this.speed * delta; break; // move down
        case 8: mx -= this.speed * delta; break; // move left
    }
    
    // TODO: check for warp tile? or just warp when leaving the screen?
    
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
        this.emit('atJunction', this.atJunction, Math.round(this.x), Math.round(this.y));
        
        if (this.atJunction & this.nextDirection) {
            this.changeDirection(this.nextDirection);
            this.nextDirection = 0;
        }
        
        this.atJunction = 0;
    }
};

Character.prototype.assignController = function(controller) {
    this.controller = controller;
};

Character.prototype.draw = function(tileSize) {
    this.getKineticShape().setAttrs({
        x: this.x * tileSize + 12,
        y: this.y * tileSize + 12
    });
};

Character.prototype.getKineticShape = function(tile) {
    return this.kineticShape || (this.kineticShape = new Kinetic.Rect({
        width: 35,
        height: 40,
        x: 0,
        y: 0,
        offsetX: 20,
        offsetY: 20,
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

Character.prototype.destroy = function() {
    this.destroyed = true;
    if (!SERVER) {
        this.getKineticShape().destroy();
    }
};

// only called by server
Character.prototype.die = function() {
    this.dead = true;
    this.speed = 0;
    this.emit('needResync');
    
    setTimeout(function(){
        this.x = this.spawnPos.x;
        this.y = this.spawnPos.y;
        this.direction = 2;
        this.speed = this.defaultSpeed
        this.dead = false;
        
        this.emit('needResync');
    }.bind(this), 5000);
};

Character.types = {'Character':Character};
Character.createFromType = function(type, maze){
    return new Character.types[type](maze);
};

(typeof module !== 'undefined') && (module.exports = Character);
