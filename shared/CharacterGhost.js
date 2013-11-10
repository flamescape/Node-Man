var Character = Character || require('./Character');

var CharacterGhost = function(maze){
    Character.apply(this, arguments);
    this.type = 'CharacterGhost';
};

CharacterGhost.prototype.__proto__ = Character.prototype;

CharacterGhost.prototype.spawnPos = {x:13.5, y:11};

CharacterGhost.prototype.getKineticShape = function() {
    if (!this.img) {
        this.img = new Image();
        this.img.src = 'img/perl.png';
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

Character.types.CharacterGhost = CharacterGhost;

(typeof module !== 'undefined') && (module.exports = CharacterGhost);
