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
            x: (num % 28) * 56,
            y: (num % 31) * 62,
            width: 56,
            height: 62,
            fill: (num % 2 === 0) ? "#EEE" : "#222"
        }));

    }); 

    stage.add(mazeLayer);
};


