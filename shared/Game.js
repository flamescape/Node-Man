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

Game.prototype.__proto__ = EventEmitter2.prototype;

Game.prototype.addCharacter = function(character) {
    this.characters.push(character);
    this.characterLayer.add(character.getKineticShape());
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
            this.emit('mazeLoaded');
        }.bind(this));
    }.bind(this));
};

Game.prototype.start = function() {
    // this is the game loop:
    this.loopInterval = setInterval(function() {
        this.tick(); // movement & collisions
        if (!SERVER) {
            this.maze.getSuperPillsLayer().getChildren().each(function(shape) {
                var rot = shape.getAttr('rotationDeg') + 4;
                shape.setAttr('rotationDeg', rot);
            });
            this.draw(); // redraw pills and characters
        }
    }.bind(this), 1000/60);
};

Game.prototype.stop = function() {
    clearInterval(this.loopInterval);
};

Game.prototype.draw = function() {
    //↓↓↓ THIS IS WRONG, IT SHOULD NOT BE HERE, ARE YOU KIDDING??? WE DON'T NEED TO DRAW THIS EVERY TIME!!!
    this.maze.getWallLayer().batchDraw();
    //TODO: FIX THIS ↑↑↑
    this.maze.getPillsLayer().batchDraw();
    this.maze.getSuperPillsLayer().batchDraw();
    
    this.characters.forEach(function(c){
        c.draw(this.tileSize);
    }.bind(this));
    this.characterLayer.batchDraw();
};

Game.prototype.tick = function() {
    this.characters.forEach(function(c){
        c.tick();
    }.bind(this));
};
