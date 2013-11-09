if (SERVER) {
    var _ = require('underscore');
}

var Maze = function(){

};

Maze.prototype.load = function(levelNum, cb) {
    var fn = 'levels/'+levelNum+'.txt';
    
    if (SERVER) {
        require('fs').readFile(path.join(__dirname, fn), function(err, data){
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
    // remove any nasty carriage returns
    data = data.replace(/\r/g, '');
    
    // determine the map width by the first newline
    this.width = data.indexOf("\n");
    
    // get the map data as an array of tiles
    data = data.replace(/\n/g, '').split('');
    
    // determine the map height by the number of rows
    this.height = (data.length / this.width) << 0;
    
    // create collision map
    this.collisions = _.map(data, function(tile){
        return tile === '#' ? 1 : 0;
    });
    
    // create pill map
    this.pills = _.map(data, function(tile){
        return tile === '.' ? 1 : (tile === '@' ? 2 : 0);
    });
    
    var tileAt = function(idx) {
        if (idx < 0 || idx >= this.collisions.length)
            return 1;
        
        return this.collisions[idx];
    }.bind(this);
    
    // create wall decoration map
    this.wallDecor = _.map(this.collisions, function(tile, idx){
        if (!tile)
            return 0;
        
        return (tileAt(idx+1) ? 1 : 0)
             | (tileAt(idx+1+this.width) ? 2 : 0)
             | (tileAt(idx+this.width) ? 4 : 0)
             | (tileAt(idx+this.width-1) ? 8 : 0)
             | (tileAt(idx-1) ? 16 : 0)
             | (tileAt(idx-this.width-1) ? 32 : 0)
             | (tileAt(idx-this.width) ? 64 : 0)
             | (tileAt(idx+1-this.width) ? 128 : 0)
             ;
    });
    
    //console.log(this.decor);
    
};
