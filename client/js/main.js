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
    //159, 111, 215, 249 are dupes
    [104,107,11,127,208,214,22,223,235,246,248,251,252,254,255,31,63].forEach(function(i){
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

