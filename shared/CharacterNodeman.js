var Character = Character || require('./Character');

var CharacterNodeman = function(maze){
    Character.apply(this, arguments);
    this.type = 'CharacterNodeman';
    this.on('atJunction', this.consumeNode.bind(this));
};

CharacterNodeman.prototype.__proto__ = Character.prototype;

CharacterNodeman.prototype.consumeNode = function(junction, x, y){
    var offset = (y * this.maze.width) + x;
    var pillType = this.maze.pills[offset];
    if (pillType) {
        console.log('waka');
    }
    this.maze.pills[offset] = 0;
};

CharacterNodeman.prototype.getKineticShape = function() {
    var img = new Image();
    img.src = 'img/node-man.png';
    
    return this.kineticShape || (this.kineticShape = new Kinetic.Rect({
        width: 40,
        height: 40,
        x: 0,
        y: 0,
        offsetX: 20,
        offsetY: 20,
        fillPatternImage: img
    }));
};

Character.types.CharacterNodeman = CharacterNodeman;

(typeof module !== 'undefined') && (module.exports = CharacterNodeman);
