/** ship*/
function ship(params) {
    this.name = 'ship';
    this.player = params.player;
    this.vel = 3;
    this.posX = (params.posX ? params.posX : 200);
    this.posY = (params.posY ? params.posY : 200);
    this.spriteX = 0;
    this.spriteY = 0;
    this.width = 30;
    this.height = 30;
    this.img = "ship";
    this.activeDirection = "down";
    this.status = 0;
    this.isRebounding = false;
    this.isSprited = false;

    /** weapon */
    this.shot = 'fireball';
    this.isShooting = false;
    this.shoots = [];
    this.context = undefined;

}

module.exports.ship = ship;


/*
 * Update ship status
 */
ship.prototype.update = function() {
    if (this.status === 0) {
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
        var val = this.status / 2;
        if (val === 1 || val === 2 || val === 4 || val === 8) {
            this.img = "rock-explosion";
        }
        this.status++;
    }

}

ship.prototype.notify = function(e) {
    if (e.type === 'keyboard' && e.player === this.player) {
        switch (e.value) {
            case "left":
                this.activeDirection = "left";
                break;
            case "up":
                this.activeDirection = "up";
                break;
            case "right":
                this.activeDirection = "right";
                break;
            case "down":
                this.activeDirection = "down";
                break;
            case "shoot":
                this.isShooting = true;
                break;
        }
        e.status = 'inactive';
    }
}

