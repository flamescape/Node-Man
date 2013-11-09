var _ = require('underscore');

var m = new Maze();
m.load(1, function(err){
    if (err) throw err;
    
    // loaded maze into m
});

var stage = new Kinetic.stage({
    container: 'map',
    width: 560,
    height: 620
});

var mapLayer = new Kinetic.layer();
