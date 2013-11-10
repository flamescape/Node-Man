var EventEmitter2 = EventEmitter2 || require('eventemitter2').EventEmitter2
  , Maze = Maze || require('./Maze')
  , Character = Character || require('./Character')
  , CharacterNodeman = CharacterNodeman || require('./CharacterNodeman')
  , CharacterGhost = CharacterGhost || require('./CharacterGhost')
  ;

if (SERVER) {
    require('colors');
    var _ = require('underscore');
}

var Game = function(io, room) {
    this.io = io; // socket io
    this.room = room; // socket io room
    this.maze = new Maze();

    this.playerSlots = [
        {type:'CharacterNodeman'},
        {type:'CharacterGhost', variant:1},
        {type:'CharacterGhost', variant:2},
        {type:'CharacterGhost', variant:3},
        {type:'CharacterGhost', variant:4}
    ];
    
    this.characters = [];
    
    if (!SERVER) {
        sock.on('characters', function(chars){
            this.reSyncCharacters(chars);
        }.bind(this));
        
        sock.on('control', function(id) {
            console.log('i\'ve been given control of', id);
            var c = this.getCharacterById(id);
            var lc = new LocalController(c, sock);
            c.assignController(lc);
        }.bind(this));
        
        sock.on('pc', function(idx) {
            this.maze.pillShapes[idx] && this.maze.pillShapes[idx].destroy()
            this.maze.getPillsLayer().batchDraw();
        }.bind(this));
        
        sock.on('drop', function(id) {
            this.dropCharacter(id);
        }.bind(this));
    }
};
Game.prototype.__proto__ = EventEmitter2.prototype;

Game.prototype.tileSize = 24;
Game.prototype.fps = 60;

Game.prototype.dropCharacter = function(id) {
    var c = this.getCharacterById(id);
    if (SERVER) {
        this.io.sockets.in(this.room).emit('drop', c.id);
        
        // free-up player slot for someone else
        this.playerSlots.some(function(ps){
            if (ps.occupied === id) {
                ps.occupied = 0;
                return true;
            }
        });
    }
    c.destroy();
    this.characters = this.characters.filter(function(c){
        return c.id !== id;
    });
};

Game.prototype.getCharacterById = function(id) {
    return _.find(this.characters, function(c){return c.id===id;});
};

Game.prototype.calcDelta = function(){
    var delta = 0;
    if (this._prevTick) {
        delta = Date.now() - this._prevTick;
    }
    this._prevTick = Date.now();
    return Math.min(delta / (1000/this.fps), 3); // maximum 3 frames skipped
};

Game.prototype.addCharacter = function(character) {
    this.characters.push(character);
    if (SERVER) {
        if (character.type === 'CharacterNodeman') {
            // augment Nodeman with the ability to enumerate other characters
            character.getOtherCharacters = function(){
                return this.characters.filter(function(c){
                    return c.type !== character.type;
                });
            }.bind(this);
        }
    } else {
        this.characterLayer.add(character.getKineticShape());
    }
    return character;
};

// call this method on the client when the level data is parsed and ready
Game.prototype.buildKineticStage = function(){
    this.characterLayer = new Kinetic.Layer();

    this.stage = new Kinetic.Stage({
        container: 'maze',
        width: this.maze.width * this.tileSize,
        height: this.maze.height * this.tileSize
    });
    this.stage.add(this.maze.getWallLayer());
    this.stage.add(this.maze.getPillsLayer());
    this.stage.add(this.maze.getSuperPillsLayer());
    this.stage.add(this.characterLayer);
    
    // create Kinetic layers
    this.maze.createWallLayer(this.tileSize);
    this.maze.createPillsLayer(this.tileSize);
    
    this.maze.getWallLayer().batchDraw();
    this.maze.getPillsLayer().batchDraw();
    
    this.emit('kineticStageReady');
};

Game.prototype.loadLevel = function(level, cb) {
    if (!SERVER) {
        this.maze.once('loaded', this.buildKineticStage.bind(this));
    }
    
    if (cb) {
        this.maze.once('loaded', cb.bind(this, this.maze));
    }
    
    this.maze.once('loaded', this.emit.bind(this, 'mazeLoaded', this.maze));
    
    this.maze.load(level);
};

Game.prototype.startLoop = function() {
    // this is the game loop:
    this.loopInterval = setInterval(function() {
        this.tick(); // movement & collisions
        if (!SERVER) {
            this.animateSuperPills(4, 155);
            this.draw(); // redraw pills and characters
        }
    }.bind(this), 1000/this.fps);
    
    if (SERVER) {
        this.syncInterval = setInterval(function() {
            this.reSyncCharacters(); // movement & collisions
        }.bind(this), 2500);
    }

    this.emit('started');
};

// this method is only used by the server to push updates to the clients
Game.prototype.reSyncCharacters = function(chars) {
    if (SERVER) {
        this.io.sockets.in(this.room).emit('characters', _.map(this.characters, function(chr){
            return _.pick(chr, ['id','type','x','y','direction','speed','nextDirection']);
        }));
    } else {
        _.each(chars, function(chr){
            if (!this.getCharacterById(chr.id)) {
                var c = this.addCharacter(Character.createFromType(chr.type, this.maze));
                c.id = chr.id;
            }
            
            _.extend(this.getCharacterById(chr.id), chr);
        }.bind(this));
    }
};

Game.prototype.stop = function() {
    clearInterval(this.loopInterval);
};

Game.prototype.draw = function() {
    this.maze.getPillsLayer().batchDraw();
    this.maze.getSuperPillsLayer().batchDraw();
    
    _.each(this.characters, function(c){
        c.draw(this.tileSize);
    }.bind(this));
    this.characterLayer.batchDraw();
};

Game.prototype.tick = function() {
    var delta = this.calcDelta();
    if (!delta) // no time has passed since last update?
        return;

    _.each(this.characters, function(c){
        c.tick(delta);
    }.bind(this));

    this.emit('tick');
};

Game.prototype.animateSuperPills = function(rotSpeed, pulseSpeed) {
    this.maze.getSuperPillsLayer().getChildren().each(function(shape) {
        var rot = shape.getAttr('rotationDeg') + rotSpeed;
        shape.setAttr('rotationDeg', rot);

        var c = Math.sin(Date.now() / pulseSpeed) + 1;
        shape.setAttr('radius', 12 + 2 * c);
    });
};

Game.prototype.log = function() {
    if (!SERVER) {
        console.log.apply(console, arguments);
    } else {
        console.log.bind(console, 'Room:', this.room.red, ':').apply(console, arguments);
    }
};

Game.create = function(io, room, startingLevel) {
    var g = new Game(io, room);
    g.loadLevel(startingLevel);
    g.once('mazeLoaded', function(){
        g.startLoop(); // start simulation
    });
    return g;
};

Game.prototype.isPlayerSlotAvailable = function() {
    return !!this.playerSlots.some(function(ps){
        return !ps.occupied;
    });
};

Game.prototype.spawnPlayer = function(sock) {
    var slot = _.find(this.playerSlots, function(ps){
        return !ps.occupied;
    });
    
    var c = Character.createFromType(slot.type, this.maze);
    this.addCharacter(c);
    //c.sock = sock;
    c.x = c.spawnPos.x;
    c.y = c.spawnPos.y;
    c.variant = slot.variant;
    slot.occupied = c.id;

    // tell sock about characters in the game
    // and broadcast new character to others
    this.reSyncCharacters();
    
    // give character control to sock
    sock.emit('control', c.id);
    
    sock.on('nd', function(nd){
        c.nextDirection = nd;
        this.once('tick', this.reSyncCharacters.bind(this));
    }.bind(this));

    sock.on('disconnect', function(){
        this.log(c.id, 'disconnected');
        this.dropCharacter(c.id);
    }.bind(this));
};

// server calls this function when a player joins the game
// (this is currently automatic on IO connect; see server.js)
Game.prototype.join = function(sock) {
    sock.join(this.room);
    // tell the client some information about the game
    sock.emit('game', _.pick(this, ['room','maze']));

    // add new character to game if available
    if (this.isPlayerSlotAvailable()) {
        this.spawnPlayer(sock);
    } else {
        // just show the spectator who is playing
        this.reSyncCharacters();
    }
    
    // notifications to all observing sockets (even spectators)
    this.maze.on('pillConsumed', function(idx, type, consumerId){
        sock.emit('pc', idx, type, consumerId);
    }.bind(this));
};

(typeof module !== 'undefined') && (module.exports = Game);
