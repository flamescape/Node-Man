// a globally defined truth
global.SERVER = true;
process.chdir(__dirname);

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

app.get('/reboot', function(){process.exit();});

var g = Game.create(io, 'game.1', 1);
g.once('started', function(){
    g.log('Game simulation started');
    
    io.sockets.on('connection', function(sock) {
        console.log('New client connected.'.cyan);
        g.join(sock);
    });
});

