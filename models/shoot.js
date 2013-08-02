/** shoot*/
function shoot(params) {
    this.name = 'shoot';
    this.player = params.player;
    this.vel = params.vel;
    this.posX = params.posX;
    this.posY = params.posY;
    this.width = 15;
    this.height = 15;
    this.img = "fireball";
    this.status = 0;
    this.isSprited = false;
}

module.exports.shoot = shoot;


/*
 * Update shoot status
 */
shoot.prototype.update = function() {
    if (this.status === 0) {
        this.posY = this.posY - this.vel;
    }
}

shoot.prototype.notify = function(e) {
    
}

