/** Rect*/
function rock(params) {
    this.name = 'rock';
    this.player = undefined;
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


/*
 * Update rock state
 */
rock.prototype.update = function(objects) {

    for (var j = 0; j < objects.length; j++) {
        switch (objects[j].name) {
            case 'ship':
                var ship = objects[j];
                if (((ship.posX >= this.posX && ship.posX <= (this.posX + this.width)) ||
                        (ship.posX + ship.width >= this.posX && ship.posX.width <= (this.posX + this.width))) &&
                        ship.posY >= this.posY && ship.posY <= this.posY + this.height && ship.state == 0) {
                    ship.state = 2;
                }
                break;
            case 'shoot':
                var shoot = objects[j];
                if (shoot.posX >= this.posX &&
                        shoot.posX <= (this.posX + this.width) &&
                        shoot.posY >= this.posY &&
                        shoot.posY <= this.posY + this.height
                        ) {
                    this.player = shoot.player;
                    this.state = 1;
                    this.clock = 0;
                    this.img = 'rock-explosion';
                }
                break;
        }

    }



    // Explotion management
    if (this.state == 1 && this.clock > (imageBuffer[this.img].width / this.width) * 2 - 2) {
        this.state = 2;
    }

    // Position management
    if (this.posY > context.height) {
        this.state = 3;
    } else {
        this.posY = this.posY + this.vel;
    }

    // Animate management
    if (this.clock % 2 == 0) {
        this.spriteX = this.width * (this.clock / 2);
        this.spriteY = 0;
    }
    if (this.clock > (imageBuffer[this.img].width / this.width) * 2 - 2) {
        this.clock = 0;
    }
    this.clock++;


}



