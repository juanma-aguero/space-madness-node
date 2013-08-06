/** Rect*/
function rock(params) {
    this.name = 'rock';
    this.vel = params.vel;
    this.posX = params.posX;
    this.spriteX = 0;
    this.spriteY = 0;
    this.posY = 0;
    this.width = 64;
    this.height = 64;
    this.img = 'rock';
    this.isSprited = true;
    this.state = 0;
    this.clock = 0;
}

module.exports.rock = rock;

/*
 * Update rock state
 */
rock.prototype.update = function(objects) {

    for (var j = 0; j < objects.length; j++) {
        var currentObj = objects[j];
        switch (currentObj.name) {
            case 'ship':
                var ship = objects[j];
                // Ship hits management
                if (((currentObj.posX >= this.posX && currentObj.posX <= (this.posX + this.width)) ||
                        (currentObj.posX + currentObj.width >= this.posX && currentObj.posX.width <= (this.posX + this.width))) &&
                        currentObj.posY >= this.posY && currentObj.posY <= this.posY + this.height && currentObj.status == 0) {
                    currentObj.status = 2;
                }
                break;
            case 'shoot':
                // Shoot hits management
                if (this.state == 0 && currentObj.posX >= this.posX &&
                        currentObj.posX <= (this.posX + this.width) &&
                        currentObj.posY >= this.posY &&
                        currentObj.posY <= this.posY + this.height
                        ) {
                    objects.splice(j, 1);
                    this.state = 1;
                    this.clock = 0;
                    this.img = 'rock-explosion';
                }
                break;

        }

    }



    // Explotion management
    if (this.state == 1 && this.clock > (1024 / this.width) * 2 - 2) {
        this.state = 2;
    }

    // Position management
    if (this.posY > 507) {
        this.state = 3;
    } else {
        this.posY = this.posY + this.vel;
    }

    // Animate management
    if (this.clock % 2 == 0) {
        this.spriteX = this.width * (this.clock / 2);
        this.spriteY = 0;
    }
    if (this.clock > (1024 / this.width) * 2 - 2) {
        this.clock = 0;
    }
    this.clock++;

}

rock.prototype.notify = function(e) {

}


