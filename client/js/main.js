var m = new Maze();
m.load(1, function(err){
    if (err) throw err;
    
    // loaded maze into m
    loadImages(drawMaze);
});

var loadImages = function(callback) {
    var tiles = {};
    var sources = {
        wall: 'img/tiles/wall-tile.png',
    };

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

    _.each(m.collisions, function(tile, num) {
        mazeLayer.add(new Kinetic.Rect({
            x: (num % 28) * 24,
            y: Math.floor(num / 28) * 24,
            width: 24,
            height: 24,
            fillPatternImage: (tile === 1 ? tiles.wall : null)
        }));

    }); 

    _.each(m.pills, function(pill, num) {
        if (pill === 1) {
            mazeLayer.add(new Kinetic.RegularPolygon({
                x: (num % 28) * 24 + 10,
                y: Math.floor(num / 28) * 24 + 10,
                radius: 4,
                sides: 6,
                fill: "#FFF"
            }));
        }

    }); 

    stage.add(mazeLayer);
    stage.add(pillsLayer);
};

