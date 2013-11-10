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

CharacterNodeman.prototype.contactCharacters = function(others) {
    var close = others.filter(function(c){
        var minDist = 0.8;
        var atOdds =
               (c.direction === 1 && this.direction === 4)
            || (c.direction === 4 && this.direction === 1)
            || (c.direction === 2 && this.direction === 8)
            || (c.direction === 8 && this.direction === 2)
        ;
        
        if (atOdds) {
            // if they're heading towards each other, safety distance is higher
            minDist = 1.5;
        }
        return Math.abs(c.x - this.x) < minDist && Math.abs(c.y - this.y) < minDist;
    }.bind(this));
    
    close.forEach(function(c){
        console.log('NODEMAN is close to:', c.id, c.type, c.x, c.y);
    });
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
