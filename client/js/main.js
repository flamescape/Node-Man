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
    width: 560,
    height: 620
});

var mazeLayer = new Kinetic.Layer();

var drawMaze = function(tiles) {

    _.each(m.collisions, function(tile, num) {
        mazeLayer.add(new Kinetic.Rect({
            x: (num % 28) * 20,
            y: Math.floor(num / 28) * 20,
            width: 20,
            height: 20,
            fillPatternImage: (tile === 1 ? tiles.wall : null)
        }));

    }); 

    stage.add(mazeLayer);
};

