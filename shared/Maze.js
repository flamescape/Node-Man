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
        // if tile is outside the map, consider it solid
        if (idx < 0 || idx >= this.collisions.length)
            return 1;
        
        return this.collisions[idx];
    }.bind(this);
    
    // create wall decoration map
    this.wallDecor = _.map(this.collisions, function(tile, idx){
        if (!tile)
            return 0;
        
        var idxA = idx-this.width
          , idxB = idx+this.width
          , isLeftmost = idx%this.width === 0
          , isRightmost = idx%this.width === this.width-1
          ;
        
        var decor = 
            // above
              ((tileAt(idxA-1) || isLeftmost) ? 1 : 0)
            | (tileAt(idxA) ? 2 : 0)
            | ((tileAt(idxA+1) || isRightmost) ? 4 : 0)
            // sides
            | ((tileAt(idx-1) || isLeftmost) ? 8 : 0)
            | ((tileAt(idx+1) || isRightmost) ? 16 : 0)
            // below
            | ((tileAt(idxB-1) || isLeftmost) ? 32 : 0)
            | (tileAt(idxB) ? 64 : 0)
            | ((tileAt(idxB+1) || isRightmost) ? 128 : 0)
        ;

        //Some tiles are duplicates, here's a better band-aid to fix that. Saves loooaaads of network bandwidth.
        switch(decor) {
            case 159: decor = 63; break;
            case 111: decor = 235; break;
            case 215: decor = 246; break;
            case 249: decor = 252; break;
        }
        return decor;
    }.bind(this));

};

Maze.prototype.createWallLayer = function(tileSize, tiles) {
    var layer = this.getWallLayer();

    _.each(this.wallDecor, function(tile, idx) {
        // don't draw blanks
        if (!tile)
            return;
        
        layer.add(new Kinetic.Rect({
            x: (idx % this.width) * tileSize,
            y: Math.floor(idx / this.width) * tileSize,
            width: tileSize,
            height: tileSize,
            fillPatternImage: tiles[tile] ? tiles[tile] : tiles.wall
        }));
        
        //if (tiles[tile]) return;
        // for debugging
        /*
        layer.add(new Kinetic.Text({
            x: (idx % this.width) * tileSize,
            y: Math.floor(idx / this.width) * tileSize,
            text: tile.toString(),
            fontSize: 10,
            fill: 'green'
        }));*/
    }.bind(this));
};

Maze.prototype.getWallLayer = function() {
    return this.wallLayer || (this.wallLayer = new Kinetic.Layer());
};

Maze.prototype.createPillsLayer = function(tileSize, tiles) {
    var pillsLayer = this.getPillsLayer();
    var superPillsLayer = this.getSuperPillsLayer();
    
    _.each(this.pills, function(pill, idx) {
        if (pill === 1) {
            pillsLayer.add(new Kinetic.RegularPolygon({
                x: (idx % this.width) * tileSize + tileSize * 0.5,
                y: Math.floor(idx / this.width) * tileSize + tileSize * 0.5,
                radius: 4,
                sides: 6,
                rotationDeg: Math.random() * (360 - 1) + 1,
                fill: "#FFF"
            }));
        } else if (pill === 2) {
            superPillsLayer.add(new Kinetic.RegularPolygon({
                x: (idx % this.width) * tileSize + tileSize * 0.5,
                y: Math.floor(idx / this.width) * tileSize + tileSize * 0.5,
                radius: 12,
                sides: 6,
                rotationDeg: Math.random() * (360 - 1) + 1,
                fill: "#FFF",
                shadowColor: "#888",
                shadowBlur: 1,
                shadowOffsetX: 2,
                shadowOffsetY: 2
            }));
        }
    }.bind(this));
};

Maze.prototype.getPillsLayer = function() {
    return this.pillsLayer || (this.pillsLayer = new Kinetic.Layer());
};

Maze.prototype.getSuperPillsLayer = function() {
    return this.SuperPillsLayer || (this.SuperPillsLayer = new Kinetic.Layer());
};
