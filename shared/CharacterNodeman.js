var Character = Character || require('./Character');

var CharacterNodeman = function(maze){
    Character.apply(this, arguments);
    this.type = 'CharacterNodeman';
    this.on('atJunction', this.consumePill.bind(this));
};

CharacterNodeman.prototype.__proto__ = Character.prototype;

CharacterNodeman.prototype.spawnPos = {x:13.5, y:23};

CharacterNodeman.prototype.consumePill = function(junction, x, y){
    if (SERVER) {
        var offset = (y * this.maze.width) + x;
        this.maze.consumePill(offset, this.id);
    }
};

CharacterNodeman.prototype.getKineticShape = function() {
    if (!this.img) {
        this.img = new Image();
        this.img.src = 'img/node-man.png';
    }
    
    return this.kineticShape || (this.kineticShape = new Kinetic.Rect({
        width: 40,
        height: 40,
        x: 0,
        y: 0,
        offsetX: 20,
        offsetY: 20,
        fillPatternImage: this.img
    }));
};

Character.types.CharacterNodeman = CharacterNodeman;

(typeof module !== 'undefined') && (module.exports = CharacterNodeman);
