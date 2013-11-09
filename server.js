// a globally defined truth
global.SERVER = true;

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('AMR6PQQjUxHNpPiC');
require('colors');

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, {log:false})
  , GameRoom = require('./shared/GameRoom')
  ;

server.listen(process.env.NODE_ENV === 'production' ? 80 : 8000, function(err) {
    if (err) { console.error(err); process.exit(-1); }

    // if run as root, downgrade to the owner of this file
    if (process.getuid && process.getuid() === 0) {
        require('fs').stat(__filename, function(err, stats) {
        if (err) { return console.error(err); }
            process.setuid(stats.uid);
        });
    }
});

app.use(express.static('client'));
app.use('/js/shared', express.static('shared'));
app.use('/js/lib/shared', express.static('node_modules'));

io.sockets.on('connection', function(sock) {
    console.log('New client connected.'.cyan);
    sock.join('waiting');
});
