
var Maze = function(){

};

Maze.prototype.load = function(levelNum, cb) {
    var fn = 'levels/'+levelNum+'.txt';
    
    if (SERVER) {
        require('fs').readFile(fn, function(err, data){
            this.parse(data);
            return cb&&cb(err);
        }.bind(this));
    } else {
        $.get(fn)
            .success(function(data){
                this.parse(data);
                return cb&&cb();
            }.bind(this))
            .fail(function(){
                cb&&cb(new Error('XHR fail'));
            });
    }
};

Maze.prototype.parse = function(data) {
    console.log('parsing', data);
};
