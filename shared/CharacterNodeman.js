var Character = Character || require('./Character');

var CharacterNodeman = function(maze){
    Character.apply(this, arguments);
    this.type = 'CharacterNodeman';
    this.spawnPos = {x:13.5, y:23};
    this.defaultDirection = 2;
    
    if (SERVER) {
        this.on('atJunction', this.consumePill.bind(this));
        this.on('atJunction', this.contactCharacters.bind(this));
    }
};

CharacterNodeman.prototype.__proto__ = Character.prototype;

// called by server only
CharacterNodeman.prototype.consumePill = function(junction, x, y){
    var offset = (y * this.maze.width) + x;
    var consumedType = this.maze.consumePill(offset, this.id);
    if (consumedType === 2) {
        this.getOtherCharacters().forEach(function(c){
            c.scare();
        });
        this.emit('needResync');
    }
};

// called by server only
CharacterNodeman.prototype.contactCharacters = function() {
    if (this.dead) {
        return false;
    }

    var others = this.getOtherCharacters();

    var close = others.filter(function(c){
        if (c.dead) {
            return false;
        }
        
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
        if (c.scared) {
            c.die();
        } else {
            this.die();
        }
    }.bind(this));
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

CharacterNodeman.prototype.draw = function(tileSize) {
    var deg = 0;
    if (this.direction === 1) deg = -90;
    if (this.direction === 4) deg = 90;
    
    this.getKineticShape().setAttrs({
        x: this.x * tileSize + 12,
        y: this.y * tileSize + 12,
        rotationDeg: deg,
        scaleX: this.direction === 8 ? -1 : 1
    });
};

Character.types.CharacterNodeman = CharacterNodeman;

(typeof module !== 'undefined') && (module.exports = CharacterNodeman);
