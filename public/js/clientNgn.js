/*********************
 * Client Ngn instance.
 *
 */
function clientNgn() {
    this.canvas = undefined;
    this.ctx = undefined;
    this.intLoop = null;
    this.objects = [];
    this.status = 'dead';
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
    }
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
clientNgn.prototype.setup = function(canvasDOMelement) {
    this.canvas = document.getElementById("canvas-layer");
    this.ctx = this.canvas.getContext("2d");
}

clientNgn.prototype.run = function() {
    var clientNgnObj = this;

    function loop() {
        setTimeout(function() {
            clientNgnObj.renderWorld();
        }, 1200);
    }
    this.stop();
    this.intLoop = setInterval(loop, 60);
}

/*
 * Stop Ngn
 */
clientNgn.prototype.stop = function() {
    clearInterval(this.intLoop);
}
