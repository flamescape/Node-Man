var g = new Game();
g.loadLevel(1);
g.once('mazeLoaded', g.start.bind(g));

var c = g.addCharacter(new Character());
c.x = 13.5*100;
c.y = 23*100;
c.assignController(new LocalController(c));

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

