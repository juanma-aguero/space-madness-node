/*********************
 * Client Ngn instance.
 *
 */
function clientNgn(params) {
    this.canvas = undefined;
    this.ctx = undefined;
    this.intLoop = null;
    this.objects = [];
    this.userInputs = [];
    this.status = 'dead';
    this.socket;
    this.worldWidth = 708;
    this.worldHeight = 507;
    this.withPrediction = (params.prediction ? params.prediction : false);
}

clientNgn.prototype.renderWorld = function() {

    // clear canvas
    this.clearCanvas();

    // draw new objects
    for (var i = 0; i < this.objects.length; i++) {
        this.drawObject(this.objects[i]);
    }
}

clientNgn.prototype.sampleUserInput = function(keyCode) {
    var keymapArrows = {left: 37, up: 38, right: 39, down: 40, shoot: 70};
    switch (keyCode) {
        case keymapArrows.left:
            return "left";
            break;
        case keymapArrows.right:
            return "right";
            break;
        case keymapArrows.up:
            return "up";
            break;
        case keymapArrows.down:
            return "down";
            break;
        case keymapArrows.shoot:
            return "shoot";
            break;
        default:
            return false;
            break;
    }
}

clientNgn.prototype.handleInput = function(input) {
    if (this.withPrediction) {
        this.userInputs.push(input);
    }
    this.socket.emit('appendEvent', input);
}

/*
 * Draw objects on canvas
 */
clientNgn.prototype.drawObject = function(object) {
    if (object.isSprited) {
        this.ctx.drawImage(imageBuffer[object.img], object.spriteX, object.spriteY, object.width, object.height, object.posX, object.posY, object.width, object.height);
    } else {
        this.ctx.drawImage(imageBuffer[object.img], object.posX, object.posY, object.width, object.height);
    }
}


/*
 * Delete objects on canvas
 */
clientNgn.prototype.clearCanvas = function() {
    // Store the current transformation matrix
    this.ctx.save();

    // Use the identity matrix while clearing the canvas
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Restore the transform
    this.ctx.restore();

}


/*
 * Setup ngn
 */
clientNgn.prototype.setup = function(socket) {
    this.canvas = document.getElementById("canvas-layer");
    this.ctx = this.canvas.getContext("2d");
    this.socket = socket;
}

clientNgn.prototype.run = function() {
    var clientNgnObj = this;

    function loop() {
        setTimeout(function() {
            if (this.withPrediction) {
                clientNgnObj.makePredictions();
                clientNgnObj.renderWorld();
                clientNgnObj.clean();
            } else {
                clientNgnObj.renderWorld();
            }
        }, 200);
    }
    this.stop();
    this.intLoop = setInterval(loop, 60);
}

clientNgn.prototype.makePredictions = function() {
    for (var j = 0; j < this.objects.length; j++) {
        for (var i = 0; i < this.userInputs.length; i++) {

            // shoot
            if (this.objects[j].player == this.userInputs[i].player
                    && this.userInputs[i].status == 'active'
                    && this.objects[j].name == "ship"
                    && this.userInputs[i].type == "keyboard"
                    && this.userInputs[i].value == "shoot") {
                this.objects.push(new shoot({player: this.userInputs[i].player, vel: 10, posX: this.objects[j].posX, posY: this.objects[j].posY}));
                this.userInputs[i].status = 'inactive';
            }
            this.objects[j].notify(this.userInputs[i]);
        }
        this.objects[j].update();
    }
}



/*
 * Stop Ngn
 */
clientNgn.prototype.stop = function() {
    clearInterval(this.intLoop);
}

clientNgn.prototype.correctObjects = function() {
    for (var j = 0; j < this.objects.length; j++) {
        if (this.objects[j].name === 'ship') {
            this.objects[j] = new ship({player: this.objects[j].player, posX: this.objects[j].posX, posY: this.objects[j].posY});
        }
        if (this.objects[j].name === 'shoot') {
            this.objects[j] = new shoot({player: this.objects[j].player, vel: 10, posX: this.objects[j].posX, posY: this.objects[j].posY});
        }
    }
}

clientNgn.prototype.clean = function() {

    // clean objects that are out of bounds
    for (var j = 0; j < this.objects.length; j++) {
        if (this.objects[j].posX > this.worldWidth
                || this.objects[j].posY > this.worldHeight + 100
                || this.objects[j].posX < -50
                || this.objects[j].posY < -50)
            this.objects.splice(j, 1);
    }

    // clean events
    for (var i = 0; i < this.userInputs.length; i++) {
        if (this.userInputs[i].status === 'inactive') {
            this.userInputs.splice(i, 1);
        }
    }
}