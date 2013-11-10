// a globally defined truth
global.SERVER = true;

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('AMR6PQQjUxHNpPiC');
require('colors');

var path = require('path')
  , port = process.env.NODE_ENV === 'production' ? 80 : 8000
  , express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, {log:false})
  , Game = require('./shared/Game')
  ;

server.listen(port, function(err) {
    if (err) { console.error(err); process.exit(-1); }
    console.log('Listening on port', port);
    // if run as root, downgrade to the owner of this file
    if (process.getuid && process.getuid() === 0) {
        require('fs').stat(__filename, function(err, stats) {
        if (err) { return console.error(err); }
            process.setuid(stats.uid);
        });
    }
});

app.use(express.static(path.join(__dirname, 'client')));
app.use('/js/shared', express.static(path.join(__dirname, 'shared')));
app.use('/js/lib/shared', express.static(path.join(__dirname, 'node_modules')));
app.use('/levels', express.static(path.join(__dirname, 'levels')));


var g = new Game(io, 'game.1');
g.loadLevel(1);
g.once('mazeLoaded', function(){
/*
    var c = g.addCharacter(new CharacterNodeman(g.maze), tiles.nodeman);
    c.x = 13.5;
    c.y = 23;
    c.assignController(new LocalController(c));
*/
    g.start(); // start simulation
});

io.sockets.on('connection', function(sock) {
    console.log('New client connected.'.cyan);
    sock.emit('startGame');
    
});
