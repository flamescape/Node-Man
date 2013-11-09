var LocalController = function(character){
    this.character = character;
    this.character.on('atJunction', this.onJunction.bind(this));
};

LocalController.prototype.onJunction = function() {
    // check if direction held against 
};

