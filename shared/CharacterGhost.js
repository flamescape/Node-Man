var Character = Character || require('./Character');

var CharacterGhost = function(maze){
    Character.apply(this, arguments);
    this.type = 'CharacterGhost';
};

CharacterGhost.prototype.__proto__ = Character.prototype;

CharacterGhost.prototype.spawnPos = {x:13.5, y:11};
CharacterGhost.prototype.defaultSpeed = 0.1;

CharacterGhost.prototype.loadImages = function() {
    if (!this.img) {
        this.img = new Image();
        this.img.src = 'img/'+this.variant+'.png';
        this.imgScared = new Image();
        this.imgScared.src = 'img/'+this.variant+'-scared.png';
    }
};

CharacterGhost.prototype.getKineticShape = function() {
    return this.kineticShape || (this.kineticShape = new Kinetic.Rect({
        width: 40,
        height: 40,
        x: 0,
        y: 0,
        offsetX: 20,
        offsetY: 20
    }));
};

CharacterGhost.prototype.draw = function() {
    Character.prototype.draw.apply(this, arguments);
    
    this.getKineticShape().setAttr('fillPatternImage', this.scared ? this.imgScared : this.img);
};

Character.types.CharacterGhost = CharacterGhost;

(typeof module !== 'undefined') && (module.exports = CharacterGhost);
