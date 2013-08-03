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
    this.intLoop = setInterval(loop, 30);
}

/*
 * Init SpaceMadness Server
 */
SpaceMadnessServer.prototype.run = function(broadcastCallback) {
    if (!this.running) {
        this.running = true;
    }
    this.startLoop(broadcastCallback);
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
 * Stop SpaceMadness
 */
SpaceMadnessServer.prototype.stop = function() {
    this.stopLoop();
    this.running = false;
}

/*
 * Update all components
 */
SpaceMadnessServer.prototype.update = function() {

    for (var j = 0; j < this.objects.length; j++) {
        for (var i = 0; i < this.eventQueue.length; i++) {

            // shoot
            if (this.objects[j].player == this.eventQueue[i].player
                    && this.eventQueue[i].status == 'active'
                    && this.objects[j].name == "ship"
                    && this.eventQueue[i].type == "keyboard"
                    && this.eventQueue[i].value == "shoot") {
                this.objects.push(new shootModule.shoot({player: this.eventQueue[i].player, vel: 10, posX: this.objects[j].posX, posY: this.objects[j].posY}));
                this.eventQueue[i].status = 'inactive';
            }

            this.objects[j].notify(this.eventQueue[i]);
        }
        this.objects[j].update();
    }

}
SpaceMadnessServer.prototype.clean = function() {

// clean objects that are out of bounds
    for (var j = 0; j < this.objects.length; j++) {
        if (this.objects[j].posX > this.worldWidth
                || this.objects[j].posY > this.worldHeight + 100
                || this.objects[j].posX < -50
                || this.objects[j].posY < -50)
            this.objects.splice(j, 1);
    }

// clean events
    for (var i = 0; i < this.eventQueue.length; i++) {
        if (this.eventQueue[i].status === 'inactive') {
            this.eventQueue.splice(i, 1);
        }
    }
}