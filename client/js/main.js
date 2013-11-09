var tSize = 24;
var mazeWidth = 28;

var m = new Maze();
m.load(1, function(err){
    if (err) throw err;
    
    // loaded maze into m
    loadImages(drawMaze);
});

var loadImages = function(callback) {
    var tiles = {};
    var sources = {
        wall: 'img/tiles/wall-tile.png'
    };
    [208,214,248,255,107,11,31,104,22,111,127,63,223,159,215,246,235,252,249,251,254].forEach(function(i){
        sources[i] = 'img/tiles/'+i+'.png';
    });

    var loadedImages = 0;
    var numImages = 0;

    // get num of sources
    for(var src in sources) {
        numImages++;
    }

    for(src in sources) {
        tiles[src] = new Image();
        tiles[src].onload = function() {
            if(++loadedImages >= numImages) {
                callback(tiles);
            }
        };
        tiles[src].src = sources[src];
    }
};

var stage = new Kinetic.Stage({
    container: 'maze',
    width: 672,
    height: 744 
});

var mazeLayer = new Kinetic.Layer();
var pillsLayer = new Kinetic.Layer();

var drawMaze = function(tiles) {

    _.each(m.wallDecor, function(tile, num) {
        // don't draw blanks
        if (!tile)
            return;
        
        mazeLayer.add(new Kinetic.Rect({
            x: (num % mazeWidth) * tSize,
            y: Math.floor(num / mazeWidth) * tSize,
            width: tSize,
            height: tSize,
            fillPatternImage: tiles[tile] ? tiles[tile] : tiles.wall
        }));
        
        //if (tiles[tile]) return;
        // for debugging
        mazeLayer.add(new Kinetic.Text({
            x: (num % mazeWidth) * tSize,
            y: Math.floor(num / mazeWidth) * tSize,
            text: tile.toString(),
            fontSize: 10,
            fill: 'blue'
        }));
    }); 

    _.each(m.pills, function(pill, num) {
        if (pill === 1) {
            mazeLayer.add(new Kinetic.RegularPolygon({
                x: (num % mazeWidth) * (tSize * 1.5),
                y: Math.floor(num / mazeWidth) * (tSize * 1.5),
                radius: 4,
                sides: 6,
                fill: "#FFF"
            }));
        }

    }); 

    stage.add(mazeLayer);
    stage.add(pillsLayer);
};

