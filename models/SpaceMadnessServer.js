var shipModule = require("./ship");
var rockModule = require("./rock");
var shootModule = require("./shoot");

var intLoop = null;
var objects = [];
var players = [];
var eventQueue = [];
var running = false;
var worldWidth = 708;
var worldHeight = 507;

function stopLoop() {
    clearInterval(intLoop);
}
function startLoop(broadcastCallback) {

    function loop() {

        // update objects
        update();

        // broadcast updates
        broadcastCallback();

        // clean events
        clean();
    }

    stopLoop();

    intLoop = setInterval(loop, 30);
}

/*
 * Init SpaceMadness Server
 */
exports.run = function(broadcastCallback) {
    if (!running) {
        running = true;
    }
    startLoop(broadcastCallback);
}

exports.addPlayer = function(params) {
    var newShip = new shipModule.ship({player: params.player, posX: 200, posY: 200});
    objects.push(newShip);
}

exports.getObjects = function() {
    return objects;
}

exports.cleanPlayer = function(player) {
    for (var j = 0; j < objects.length; j++) {
        if (objects[j].player == player) {
            objects.splice(j, 1);
        }
    }
}

exports.appendEvent = function(e) {
    eventQueue.push(e);
}


/*
 * Stop SpaceMadness
 */
exports.stop = function() {
    stopLoop();
    running = false;
}

/*
 * Update all components
 */
function update() {

    for (var j = 0; j < objects.length; j++) {
        for (var i = 0; i < eventQueue.length; i++) {

            // shoot
            if (objects[j].player == eventQueue[i].player
                    && eventQueue[i].status == 'active'
                    && objects[j].name == "ship"
                    && eventQueue[i].type == "keyboard"
                    && eventQueue[i].value == "shoot") {
                objects.push(new shootModule.shoot({player: eventQueue[i].player, vel: 10, posX: objects[j].posX, posY: objects[j].posY}));
                eventQueue[i].status = 'inactive';
            }

            objects[j].notify(eventQueue[i]);
        }
        objects[j].update();
    }

}
function clean() {

    // clean objects that are out of bounds
    for (var j = 0; j < objects.length; j++) {
        if (objects[j].posX > worldWidth
                || objects[j].posY > worldHeight + 100
                || objects[j].posX < -50
                || objects[j].posY < -50)
            objects.splice(j, 1);
    }

    // clean events
    for (var i = 0; i < eventQueue.length; i++) {
        if (eventQueue[i].status === 'inactive') {
            eventQueue.splice(i, 1);
        }
    }
}
//exports.generateRocks = function() {
//    var count = (1 + (Math.random() * (2 - 1)));
//    for (var i = 0; i < count; i++) {
//        var randomVel = (2 + (Math.random() * (5 - 2)));
//        var randomPosX = (2 + (0 + (Math.random() * (700 - 20))));
//        objects.push(new rock({vel: randomVel, posX: randomPosX}));
//        socket.emit('appendEvent', {type: 'newRock', player: username, value: {vel: randomVel, posX: randomPosX}, status: 'active'});
//    }
//}
