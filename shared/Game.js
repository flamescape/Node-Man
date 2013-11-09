var EventEmitter2 = EventEmitter2 || require('eventemitter2');

var Game = function() {
};
Game.prototype.__proto__ = EventEmitter2.prototype;

Game.prototype.addCharacter = function(character) {

};

Game.prototype.loadLevel = function(level) {

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
