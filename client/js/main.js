var m = new Maze();
m.load(1, function(err){
    if (err) throw err;
    
    // loaded maze into m
    drawMaze();
});

var stage = new Kinetic.Stage({
    container: 'maze',
    width: 560,
    height: 620
});

var mazeLayer = new Kinetic.Layer();

var drawMaze = function() {
    _.each(m.collisions, function(tile, num) {
        mazeLayer.add(new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 56,
            height: 62,
            fill: "#EE0000"
        }));

    }); 

    stage.add(mazeLayer);
};


