var shipModule = require("./ship");
var rockModule = require("./rock");
var shootModule = require("./shoot");


/**
 * SpaceMadness Game Server
 */
function SpaceMadnessServer(params) {
    this.intLoop = null;
    this.objects = [];
    this.players = [];
    this.eventQueue = [];
    this.running = false;
    this.gameStarted = false;
    this.worldWidth = 708;
    this.worldHeight = 507;
}
module.exports.SpaceMadnessServer = SpaceMadnessServer;

SpaceMadnessServer.prototype.stopLoop = function() {
    clearInterval(this.intLoop);
}
SpaceMadnessServer.prototype.startLoop = function(broadcastCallback) {
    var serverInstance = this;
    function loop() {

        // update objects
        serverInstance.update();
        // broadcast updates
        broadcastCallback();
        // clean events
        serverInstance.clean();
    }

    this.stopLoop();
    this.intLoop = setInterval(loop, 40);
}

/*
 * Init SpaceMadness Server
 */
SpaceMadnessServer.prototype.run = function(broadcastCallback) {
    if (!this.running) {
        this.running = true;
    }
    if (!this.gameStarted) {
        var randomVel = (2 + (Math.random() * (5 - 2)));
        var randomPosX = (2 + (0 + (Math.random() * (700 - 20))));
        this.objects.push(new rockModule.rock({vel: randomVel, posX: randomPosX}));
        this.gameStarted = true;
    }
    this.startLoop(broadcastCallback);
}

/*
 * Stop SpaceMadness
 */
SpaceMadnessServer.prototype.stop = function() {
    this.stopLoop();
    this.running = false;
}

SpaceMadnessServer.prototype.addPlayer = function(params) {
    var newShip = new shipModule.ship({player: params.player, posX: 200, posY: 200});
    this.objects.push(newShip);
}

SpaceMadnessServer.prototype.getObjects = function() {
    return this.objects;
}

SpaceMadnessServer.prototype.cleanPlayer = function(player) {
    for (var j = 0; j < this.objects.length; j++) {
        if (this.objects[j].player == player) {
            this.objects.splice(j, 1);
        }
    }
}

SpaceMadnessServer.prototype.appendEvent = function(e) {
    this.eventQueue.push(e);
}




/*
 * Update all components
 */
SpaceMadnessServer.prototype.update = function() {

    for (var j = 0; j < this.objects.length; j++) {
        var currentObj = this.objects[j];
        for (var i = 0; i < this.eventQueue.length; i++) {

            // shoot
            if (currentObj.player == this.eventQueue[i].player
                    && this.eventQueue[i].status == 'active'
                    && currentObj.name == "ship"
                    && this.eventQueue[i].type == "keyboard"
                    && this.eventQueue[i].value == "shoot") {
                this.objects.push(new shootModule.shoot({player: this.eventQueue[i].player, vel: 10, posX: currentObj.posX, posY: currentObj.posY}));
                this.eventQueue[i].status = 'inactive';
            }

            currentObj.notify(this.eventQueue[i]);
        }
        switch (currentObj.name) {
            case 'rock':
                if (currentObj.state <= 1) {
                    currentObj.update(this.objects);
                }
                if (currentObj.state == 2) {
                    this.objects.splice(j, 1);
                    var randomVel = (2 + (Math.random() * (5 - 2)));
                    var randomPosX = (2 + (0 + (Math.random() * (700 - 20))));
                    this.objects.push(new rockModule.rock({vel: randomVel, posX: randomPosX}));
                }
                if (currentObj.state == 3) {
                    this.objects.splice(j, 1);
                    this.generateRocks();
                }
                break;
            case 'ship':
                if (currentObj.status <= 8) {
                    currentObj.update();
                } else {
                    this.stop();
                    //gameOver();
                }
                break;
            case 'shoot':
                currentObj.update();
                break;
        }

    }

}

SpaceMadnessServer.prototype.generateRocks = function() {
    var count = (1 + (Math.random() * (2 - 1)));
    for (var i = 0; i < count; i++) {
        var randomVel = (2 + (Math.random() * (5 - 2)));
        var randomPosX = (2 + (0 + (Math.random() * (700 - 20))));
        this.objects.push(new rockModule.rock({vel: randomVel, posX: randomPosX}));
    }
}

SpaceMadnessServer.prototype.clean = function() {

// clean objects that are out of bounds
    for (var j = 0; j < this.objects.length; j++) {
        var currentObj = this.objects[j];
        if (currentObj.posX > this.worldWidth
                || currentObj.posY > this.worldHeight + 100
                || currentObj.posX < -50
                || currentObj.posY < -50)
            this.objects.splice(j, 1);
    }

// clean events
    for (var i = 0; i < this.eventQueue.length; i++) {
        if (this.eventQueue[i].status === 'inactive') {
            this.eventQueue.splice(i, 1);
        }
    }
}