/** ship*/
function ship(params) {
    this.name = 'ship';
    this.player = params.player;
    this.vel = 6;
    this.gameEventQueue = params.events;
    this.keymap = (params.keymap ? params.keymap : undefined);
    this.posX = (params.posX ? params.posX : 200);
    this.posY = (params.posY ? params.posY : 200);
    this.spriteX = 0;
    this.spriteY = 0;
    this.width = 30;
    this.height = 30;
    this.img = "ship";
    this.activeDirection = "down";
    this.state = 0;
    this.isRebounding = false;
    this.isSprited = false;

    /** weapon */
    this.shot = 'fireball';
    this.isShooting = false;
    this.shoots = [];
    this.context = undefined;

}


/*
 * Update ship state
 */
ship.prototype.update = function(ctx) {
    if (this.gameEventQueue) {
        for (var i = 0; i < this.gameEventQueue.length; i++) {
            var e = this.gameEventQueue[i];
            if (e.type === 'keyboard' && e.player === this.player) {
                switch (e.value) {
                    case this.keymap.left:
                        this.activeDirection = "left";
                        e.status = 'inactive';
                        break;
                    case this.keymap.up:
                        this.activeDirection = "up";
                        e.status = 'inactive';
                        break;
                    case this.keymap.right:
                        this.activeDirection = "right";
                        e.status = 'inactive';
                        break;
                    case this.keymap.down:
                        this.activeDirection = "down";
                        e.status = 'inactive';
                        break;
                    case this.keymap.shoot:
                        e.status = 'inactive';
                        var lazer = new Audio("./sounds/laser.ogg");
                        lazer.play();
                        var nShoot = [];
                        nShoot[0] = this.posX + 10;
                        nShoot[1] = this.posY + 10;
                        this.shoots.push(nShoot);
                        this.isShooting = true;
                        break;
                }
            }
        }
    }
    this.context = ctx;
    if (this.state == 0) {
        switch (this.activeDirection) {
            case "left":
                if (this.posX > 0) {
                    this.posX = this.posX - this.vel;
                }
                break;
            case "up":
                if (this.posY > 0) {
                    this.posY = this.posY - this.vel;
                }
                break;
            case "right":
                if (this.posX < 678) {
                    this.posX = this.posX + this.vel;
                }
                break;
            case "down":
                if (this.posY < 540) {
                    this.posY = this.posY + this.vel;
                }
                break;
        }
    } else {
        var val = this.state / 2;
        if (val == 1 || val == 2 || val == 4 || val == 8) {
            this.img = "rock-explosion";
        }
        this.state++;
    }



    if (this.isShooting) {
        for (var i = 0; i < this.shoots.length; i++) {
            this.shoots[i][1] = this.shoots[i][1] - 10;
        }
        this.drawShoots(ctx);
    }

}


/*
 * Filter event
 */
ship.prototype.notify = function(e) {
    switch (e.keyCode) {
        case this.keymap.left:
            this.activeDirection = "left";
            break;
        case this.keymap.up:
            this.activeDirection = "up";
            break;
        case this.keymap.right:
            this.activeDirection = "right";
            break;
        case this.keymap.down:
            this.activeDirection = "down";
            break;
        case this.keymap.shoot:
            var lazer = new Audio("./sounds/laser.ogg");
            lazer.play();
            var nShoot = [];
            nShoot[0] = this.posX + 10;
            nShoot[1] = this.posY + 10;
            this.shoots.push(nShoot);
            this.isShooting = true;
            break;
    }



}


ship.prototype.drawShoots = function(ctx) {

    for (i = 0; i < this.shoots.length; i++) {
        ctx.clearRect(this.shoots[i][0], this.shoots[i][1] + 10, 15, 15);
        ctx.drawImage(imageBuffer[this.shot], this.shoots[i][0], this.shoots[i][1], 15, 15);
    }

}

ship.prototype.clearShoot = function(x, y) {
    this.context.clearRect(x, y, 15, 15);

}




