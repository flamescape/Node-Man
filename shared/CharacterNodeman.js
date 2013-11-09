var Character = Character || require('shared/Character');

var CharacterNodeman = function(){
    Character.apply(this, arguments);
    
    this.on('atJunction', this.consumeNode.bind(this));
};

CharacterNodeman.prototype.__proto__ = Character.prototype;

CharacterNodeman.prototype.consumeNode = function(junction, x, y){
    var offset = (y * this.maze.width) + x;
    if (this.maze.pills[offset]) {
        new Audio('audio/waka.ogg').play();
        console.log('waka');
    }
    this.maze.pills[offset] = 0;
};
