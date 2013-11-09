var tSize = 24;

var m = new Maze();
m.load(1, function(err){
    if (err) throw err;
    
    var stage = new Kinetic.Stage({
        container: 'maze',
        width: m.width * tSize,
        height: m.height * tSize
    });
    
    // loaded maze into m
    loadImages(function(tiles){
        stage.add(m.createWallKineticLayer(tSize, tiles));
        stage.add(m.createPillsKineticLayer(tSize, tiles));
    });
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

