// a globally defined truth
global.SERVER = true;

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('AMR6PQQjUxHNpPiC');
require('colors');

var port = process.env.NODE_ENV === 'production' ? 80 : 8000
  , express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, {log:false})
  , GameRoom = require('./shared/GameRoom')
  ;

server.listen(port, function(err) {
    if (err) { console.error(err); process.exit(-1); }
    console.log((new Date()).toString(), 'Listening on port', port);
    // if run as root, downgrade to the owner of this file
    if (process.getuid && process.getuid() === 0) {
        require('fs').stat(__filename, function(err, stats) {
        if (err) { return console.error(err); }
            process.setuid(stats.uid);
        });
    }
});

app.use(function(req, res, next){
    console.log('Request rec\'d from', req.ip, req.url);
    next();
});

app.use(express.static('client'));
app.use('/js/shared', express.static('shared'));
app.use('/js/lib/shared', express.static('node_modules'));
app.use('/levels', express.static('levels'));

io.sockets.on('connection', function(sock) {
    console.log('New client connected.'.cyan);
    sock.join('waiting');
});
