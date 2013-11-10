var g = new Game();
var tiles = {};
g.loadLevel(1);
g.once('mazeLoaded', function(){
    var c = g.addCharacter(new CharacterNodeman(g.maze), tiles.nodeman);
    c.x = 13.5;
    c.y = 23;
    c.assignController(new LocalController(c));
    g.start();
});

var loadImages = function(callback) {
    var sources = {
        wall: 'img/tiles/wall-tile.png',
        nodeman: 'img/node-man.png'
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

