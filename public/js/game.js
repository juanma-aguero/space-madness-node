/*********************
 * GAME class
 *
 */
function game() {
    this.ctx = undefined;
    this.intLoop = null;
    this.objects = [];
    this.eventQueue = [];
    this.points = 0;
}

/*
 * Draw objects on canvas
 */
game.prototype.drawObject = function(object) {
    if (object.isSprited) {
        this.ctx.drawImage(imageBuffer[object.img], object.spriteX, object.spriteY, object.width, object.height, object.posX, object.posY, object.width, object.height);
    } else {
        this.ctx.drawImage(imageBuffer[object.img], object.posX, object.posY, object.width, object.height);
    }
}


/*
 * Delete objects on canvas
 */
game.prototype.deleteObject = function(object) {
    this.ctx.clearRect(object.posX, object.posY, object.width, object.height);
}


/*
 * Init game functionalitys
 */
game.prototype.init = function() {
    var canvas = document.getElementById("canvas-layer");
    this.ctx = canvas.getContext("2d");

    this.startLoop();


}

game.prototype.startLoop = function() {
    var gameObj = this;

    function loop() {
        // delete old objects
        for (var i = 0; i < gameObj.objects.length; i++) {
            gameObj.deleteObject(gameObj.objects[i]);
        }

        // update states
        gameObj.update();

        // draw new objects
        for (var i = 0; i < gameObj.objects.length; i++) {
            gameObj.drawObject(gameObj.objects[i]);
        }

        //clean inactive events
        for (var i = 0; i < gameObj.eventQueue.length; i++) {
            if (gameObj.eventQueue[i].status === 'inactive') {
                gameObj.eventQueue.splice(i, 1);
            }
        }

    }

    this.stop();

    this.intLoop = setInterval(loop, 30);
}

/*
 * Stop game
 */
game.prototype.stop = function() {
    clearInterval(this.intLoop);
}


/*
 * Update all components
 */
game.prototype.update = function() {

    for (var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        switch (obj.name) {
            case 'rock':
                if (obj.state <= 1) {
                    obj.update(this.objects);
                }
                if (obj.state == 2) {
                    this.objects.splice(i, 1);
                    this.objects.push(new rock());
                }
                if (obj.state == 3) {
                    this.objects.splice(i, 1);
                    this.generateRocks();
                }
                break;
            case 'ship':
                if (obj.state <= 8) {
                    obj.update(this.ctx);
                } else {
                    this.stop();
                    gameOver()
                }
                break;
        }

    }

    for (var i = 0; i < this.eventQueue.length; i++) {
        if (this.eventQueue[i].type === 'newShip') {
            this.objects.push(new ship(this.eventQueue[i].value));
            this.eventQueue[i].status = 'inactive';
        }
        if (this.eventQueue[i].type === 'newRock') {
            this.objects.push(new rock({vel: this.eventQueue[i].value.vel, posX: this.eventQueue[i].value.posX}));
            this.eventQueue[i].status = 'inactive';
        }
    }

}

game.prototype.generateRocks = function() {
    var count = (1 + (Math.random() * (2 - 1)));
    for (var i = 0; i < count; i++) {
        var randomVel = (2 + (Math.random() * (5 - 2)));
        var randomPosX = (2 + (0 + (Math.random() * (700 - 20))));
        this.objects.push(new rock({vel: randomVel, posX: randomPosX}));
        socket.emit('appendEvent', {type: 'newRock', player: username, value: {vel: randomVel, posX: randomPosX}, status: 'active'});
    }
}
