var tiles = {};

var sock = io.connect();

sock.on('game', function(d){
    console.log('game', d);
    
    var g = new Game(sock);
    g.loadLevel(d.maze);
    g.startLoop();
    
    sock.on('readyGo', function(delay){
        setTimeout(function(){
            g.txtReady.setOpacity(1);
            setTimeout(function(){
                g.txtReady.setOpacity(0);
                g.txtGo.setOpacity(1);
                (new Kinetic.Tween({
                    node: g.txtGo, 
                    duration: 1,
                    opacity: 0
                })).play();
            }, 1500);
        }, delay);
    });
});

sock.on('spectator', function(b){
    console.log('I am spectating');
    jQuery('#spec')[b?'show':'hide']();
});

sock.on('lives', function(lives) {
    if (lives >= 0) {
        jQuery('#lives img').hide();
        jQuery('#lives img.lv'+lives).show();
    }
});

/* prevent keys from scrolling page */
jQuery(document).keydown(function(e) {
    if($.inArray(e.which,[33,34,35,36,37,38,39,40]) > -1) {
        e.preventDefault();
        return false;
    }
    return true;
});