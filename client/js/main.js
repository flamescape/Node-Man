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
        console.log("Placing tile #" + num + " (" + tile + ") at " + num%28*20 + ", " + Math.floor(num/28)*20);
        mazeLayer.add(new Kinetic.Rect({
            x: (num % 28) * 20,
            y: Math.floor(num / 28) * 20,
            width: 20,
            height: 20,
            fill: (tile === 0) ? "#EEE" : "#222"
        }));

    }); 

    stage.add(mazeLayer);
};


