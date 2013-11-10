var tiles = {};

var sock = io.connect();

sock.on('game', function(d){
    console.log('game', d);
    
    var g = new Game(sock);
    g.loadLevel(d.maze);
    g.startLoop();
});

/* prevent keys from scrolling page */
jQuery(document).keydown(function(e) {
    if($.inArray(e.which,[33,34,35,36,37,38,39,40]) > -1) {
        e.preventDefault();
        return false;
    }
    return true;
});