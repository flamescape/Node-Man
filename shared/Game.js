var EventEmitter2 = EventEmitter2 || require('eventemitter2');

var Game = function() {
};
Game.prototype.__proto__ = EventEmitter2.prototype;

Game.prototype.addCharacter = function(character) {
    this.characterLayer.add(character.getKineticShape());
};

Game.prototype.loadLevel = function(level) {
    this.maze = new Maze();
    this.maze.load(1, function(err){
        if (err) throw err;
        
        var stage = new Kinetic.Stage({
            container: 'maze',
            width: this.maze.width * tSize,
            height: this.maze.height * tSize
        });
        
        // loaded maze into m
        loadImages(function(tiles){
            stage.add(this.maze.getWallLayer(tSize, tiles));
            stage.add(this.maze.getPillsLayer(tSize, tiles));
        }.bind(this));
    }.bind(this));
};

Game.prototype.start = function() {
    // this is the game loop:
    this.loopInterval = setInterval(function() {
        this.tick(); // movement & collisions
        this.draw(); // redraw pills and characters
    }.bind(this), 1000/60);
};

Game.prototype.stop = function() {
    clearInterval(this.loopInterval);
};

Game.prototype.draw = function() {
};

Game.prototype.tick = function() {
};
