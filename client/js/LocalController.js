var LocalController = function(character){
    this.character = character;
    this.character.on('atJunction', this.onJunction.bind(this));
};

LocalController.prototype.onJunction = function(axis) {
    // check if direction held against
    var newDir = 0; // todo, what keys are held?
    
    this.character.changeDirection(newDir);
};

