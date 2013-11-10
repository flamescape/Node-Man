var EventEmitter2 = EventEmitter2 || require('eventemitter2');

var Game = function() {
    this.characters = [];
    this.characterLayer = new Kinetic.Layer();
    
    this.on('mazeLoaded', function(){
        this.stage = new Kinetic.Stage({
            container: 'maze',
            width: this.maze.width * this.tileSize,
            height: this.maze.height * this.tileSize
        });
    
        this.stage.add(this.maze.getWallLayer());
        this.stage.add(this.maze.getPillsLayer());
        this.stage.add(this.maze.getSuperPillsLayer());
        this.stage.add(this.characterLayer);
    }.bind(this));
};
Game.prototype.tileSize = 24;
Game.prototype.fps = 60;

Game.prototype.calcDelta = function(){
    var delta = 0;
    if (this._prevTick) {
        delta = Date.now() - this._prevTick;
    }
    this._prevTick = Date.now();
    return delta && delta / (1000/this.fps);
};

Game.prototype.__proto__ = EventEmitter2.prototype;

Game.prototype.addCharacter = function(character, tile) {
    this.characters.push(character);
    this.characterLayer.add(character.getKineticShape(tile));
    return character;
};

Game.prototype.loadLevel = function(level) {
    this.maze = new Maze();
    this.maze.load(1, function(err){
        if (err) throw err;
        
        var stage = new Kinetic.Stage({
            container: 'maze',
            width: this.maze.width * this.tileSize,
            height: this.maze.height * this.tileSize
        });
        stage.add(this.maze.getWallLayer());
        stage.add(this.maze.getPillsLayer());
        stage.add(this.maze.getSuperPillsLayer());
        
        // loaded maze into m
        loadImages(function(tiles){
            this.maze.createWallLayer(this.tileSize, tiles);
            this.maze.createPillsLayer(this.tileSize, tiles);
            this.maze.getWallLayer().batchDraw();
            this.emit('mazeLoaded');
        }.bind(this));
    }.bind(this));
};

Game.prototype.start = function() {
    // this is the game loop:
    this.loopInterval = setInterval(function() {
        this.tick(); // movement & collisions
        if (!SERVER) {
            this.animateSuperPills(4, 155);
            this.draw(); // redraw pills and characters
        }
    }.bind(this), 1000/this.fps);
};

Game.prototype.stop = function() {
    clearInterval(this.loopInterval);
};

Game.prototype.draw = function() {
    this.maze.getPillsLayer().batchDraw();
    this.maze.getSuperPillsLayer().batchDraw();
    
    this.characters.forEach(function(c){
        c.draw(this.tileSize);
    }.bind(this));
    this.characterLayer.batchDraw();
};

Game.prototype.tick = function() {
    var delta = this.calcDelta();
    if (!delta) // no time has passed since last update?
        return;
        
    this.characters.forEach(function(c){
        c.tick(delta);
    }.bind(this));
};

Game.prototype.animateSuperPills = function(rotSpeed, pulseSpeed) {
    this.maze.getSuperPillsLayer().getChildren().each(function(shape) {
        var rot = shape.getAttr('rotationDeg') + rotSpeed;
        shape.setAttr('rotationDeg', rot);

        var c = Math.sin(Date.now() / pulseSpeed) + 1;
        shape.setAttr('radius', 12 + 2 * c);
    });
};
