var EventEmitter2 = EventEmitter2 || require('eventemitter2');

var Character = function() {
    this.x = 0;
    this.y = 0;
};
Character.prototype.__proto__ = EventEmitter2.prototype;

Character.prototype.a = function() {
};
