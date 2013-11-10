var LocalController = function(character, sock){
    this.character = character;
    this.sock = sock;
    
    key('up, w', this.newDirection.bind(this, 1));
    key('right, d', this.newDirection.bind(this, 2));
    key('down, s', this.newDirection.bind(this, 4));
    key('left, a', this.newDirection.bind(this, 8));
};

LocalController.prototype.newDirection = function(direction) {
    //this.character.nextDirection = direction;
    this.sock.emit('nd', direction);
};
