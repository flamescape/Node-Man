var tiles = {};

var sock = io.connect();

sock.on('game', function(d){
    console.log('game', d);
    
    var g = new Game(sock);
    g.loadLevel(d.maze);
    g.startLoop();
});
