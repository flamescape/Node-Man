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
    this.maze = new Maze(this.tileSize);
    this.lives = 3;
    this.spectators = [];

    this.playerSlots = [
        {type:'CharacterNodeman'},
        {type:'CharacterGhost', variant:'python', x: 12},
        {type:'CharacterGhost', variant:'ruby', x: 15},
        {type:'CharacterGhost', variant:'php', x: 10},
        {type:'CharacterGhost', variant:'perl', x: 17}
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
        
        sock.on('newpills', function(pills){
            setTimeout(this.maze.resetPills.bind(this.maze, pills), 1000);
        }.bind(this));
    }
};
Game.prototype.__proto__ = EventEmitter2.prototype;

Game.prototype.tileSize = 24;
Game.prototype.fps = 60;

Game.prototype.resetPositions = function(delay) {
    this.io.sockets.in(this.room).emit('readyGo', delay);
    
    this.characters.forEach(function(c){
        c.speed = 0;
    });
    this.reSyncCharacters();
    
    setTimeout(function(){
       
        this.characters.forEach(function(c){
            c.x = c.spawnPos.x;
            c.y = c.spawnPos.y;
            c.direction = c.defaultDirection;
            c.speed = 0;
            c.nextDirection = 0;
            c.dead = false;
            c.scared = false;
        });
        this.reSyncCharacters();
        
        setTimeout(function(){
            this.characters.forEach(function(c){
                c.speed = c.defaultSpeed;
            }.bind(this));
            this.reSyncCharacters();
        }.bind(this), 2000);
        
    }.bind(this), delay || 1);
};

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
    
    if (this.isPlayerSlotAvailable() && this.spectators.length) {
        this.join(this.spectators.shift());
    }
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
            this.io.sockets.in(this.room).emit('lives', this.lives = 3);
            
            // augment Nodeman with the ability to enumerate other characters
            character.getOtherCharacters = function(){
                return this.characters.filter(function(c){
                    return c.type !== character.type;
                });
            }.bind(this);
            
            character.on('died', function(){
                --this.lives;
                
                if (!this.lives) {
                    this.dropCharacter(character.id);
                    character.sock.emit('spectator', true);
                } else {
                    this.io.sockets.in(this.room).emit('lives', this.lives);
                }
                
                this.resetPositions(1000);
            }.bind(this));
        }
    } else {
        this.characterLayer.add(character.getKineticShape());
    }
    return character;
};

// call this method on the client when the level data is parsed and ready
Game.prototype.buildKineticStage = function(){
    this.characterLayer = new Kinetic.Layer();
    this.textLayer = new Kinetic.Layer();

    this.stage = new Kinetic.Stage({
        container: 'maze',
        width: this.maze.width * this.tileSize,
        height: this.maze.height * this.tileSize
    });
    this.stage.add(this.maze.getWallLayer());
    this.stage.add(this.maze.getPillsLayer());
    this.stage.add(this.maze.getSuperPillsLayer());
    this.stage.add(this.characterLayer);
    this.stage.add(this.textLayer);
    
    this.txtReady = new Kinetic.Text({
        x: (this.stage.getWidth() / 2) - 100,
        y: (this.stage.getHeight() / 2) + 29,
        width: 200,
        text: 'READY?!',
        fontSize: 40,
        fontFamily: 'Play',
        fill: '#f3ec19',
        fontStyle: 'bold',
        align: 'center',
        opacity: 0
    });
    this.textLayer.add(this.txtReady);
    this.txtGo = new Kinetic.Text({
        x: (this.stage.getWidth() / 2) - 100,
        y: (this.stage.getHeight() / 2) + 29,
        width: 200,
        text: 'GO!',
        fontSize: 40,
        fontFamily: 'Play',
        fill: '#f3ec19',
        fontStyle: 'bold',
        align: 'center',
        opacity: 0
    });
    this.textLayer.add(this.txtGo);
    
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
        
        this.maze.on('pillConsumed', function(){
            if (!this.maze.pills.some(function(p){return !!p;})) {
                this.log('we\'re done');
                this.resetPositions(1000);
                this.maze.resetPills();
                this.io.sockets.in(this.room).emit('newpills', this.maze.pills);
            }
        }.bind(this));
    }

    this.emit('started');
};

// this method is only used by the server to push updates to the clients
Game.prototype.reSyncCharacters = function(chars) {
    if (SERVER) {
        this.io.sockets.in(this.room).emit('characters', _.map(this.characters, function(chr){
            return _.pick(chr, ['id','type','x','y','direction','speed','nextDirection','scared','variant']);
        }));
    } else {
        _.each(chars, function(chr){
            if (!this.getCharacterById(chr.id)) {
                var c = this.addCharacter(Character.createFromType(chr.type, this.maze));
                c.id = chr.id;
            }
            
            var c = this.getCharacterById(chr.id)
            _.extend(c, chr);
            c.loadImages();
        }.bind(this));
    }
};

Game.prototype.stop = function() {
    clearInterval(this.loopInterval);
    if (SERVER) {
        clearInterval(this.syncInterval);
    }
};

Game.prototype.draw = function() {
    this.maze.getPillsLayer().batchDraw();
    this.maze.getSuperPillsLayer().batchDraw();
    
    _.each(this.characters, function(c){
        c.draw(this.tileSize);
    }.bind(this));
    this.characterLayer.batchDraw();
    this.textLayer.batchDraw();
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
    c.sock = sock;
    if (slot.x) {
        c.spawnPos.x = slot.x;
    }
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
        if (!c.dead) {
            c.nextDirection = nd;
        }
        this.once('tick', this.reSyncCharacters.bind(this));
    }.bind(this));
    
    c.on('needResync', this.reSyncCharacters.bind(this));

    sock.on('disconnect', function(){
        this.log(c.id, 'disconnected');
        this.dropCharacter(c.id);
        this.spectators = this.spectators.filter(function(s){
            return sock !== s;
        });
    }.bind(this));
    
    if (this.characters.length === 1) {
        this.resetPositions();
    }
};

// server calls this function when a player joins the game
// (this is currently automatic on IO connect; see server.js)
Game.prototype.join = function(sock) {
    sock.join(this.room);
    // tell the client some information about the game
    sock.emit('game', _.pick(this, ['room','maze']));
    sock.emit('lives', this.lives);

    // add new character to game if available
    if (this.isPlayerSlotAvailable()) {
        this.spawnPlayer(sock);
    } else {
        // just show the spectator who is playing
        sock.emit('spectator', true);
        this.spectators.push(sock);
        this.reSyncCharacters();
    }
    
    // notifications to all observing sockets (even spectators)
    this.maze.on('pillConsumed', function(idx, type, consumerId){
        sock.emit('pc', idx, type, consumerId);
    }.bind(this));
};

(typeof module !== 'undefined') && (module.exports = Game);
