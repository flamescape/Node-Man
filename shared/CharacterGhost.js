var Character = Character || require('./Character');

var CharacterGhost = function(maze){
    Character.apply(this, arguments);
    this.type = 'CharacterGhost';
    
    this.defaultDirection = 4;
    this.direction = 4;
    this.spawnPos = {x:13.5, y:11};
    
    this.on('died', function(){
        this.speed = 0;
        this.scared = false;
        this.x = 13.5;
        this.y = this.spawnPos.y+3;
        this.emit('needResync');
        
        setTimeout(function(){
            this.x = this.spawnPos.x;
            this.y = this.spawnPos.y;
            this.direction = 4;
            this.speed = this.defaultSpeed;
            this.dead = false;
            
            this.emit('needResync');
        }.bind(this), 6000);
    }.bind(this));
};

CharacterGhost.prototype.__proto__ = Character.prototype;

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
