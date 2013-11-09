var LocalController = function(character){
    this.character = character;
    this.character.on('atJunction', this.onJunction.bind(this));
    this.nextDirection = 0;
    
    key('up, w', function(){ this.nextDirection = 1; }.bind(this));
    key('right, d', function(){ this.nextDirection = 2; }.bind(this));
    key('down, s', function(){ this.nextDirection = 4; }.bind(this));
    key('left, a', function(){ this.nextDirection = 8; }.bind(this));
};

LocalController.prototype.onJunction = function(axis) {
    if (axis & this.nextDirection) {
        this.character.changeDirection(this.nextDirection);
        this.nextDirection = 0;
    }
};
