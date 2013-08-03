var game = undefined;
var socketIOReady = $.Deferred();
var socket = undefined;
var percentage = 5;
imageBuffer = new Array();
context = {width: 708, height: 570};
soundBuffer = new Array();

function updatePlayers(players) {
    $('#players').empty();
    for (var i = 0; i < players.length; i++) {
        $('#players').append("<div><span>" + players[i].username + "</span>:<span>" + players[i].points + "</span></div>");
    }
}



function joinGame() {
    game = new clientNgn({prediction: false});
    $("#connectBtn").hide();
    $("#connectingText").show();
    $("#connectingLoader").show();
    socket = io.connect();
    game.setup(socket);

    socket.on('connect', function() {
        if (!username.length > 0) {
            username = "player" + parseInt((2 + (Math.random() * (9 - 2))));
        }
        socket.emit('joinGame', {roomName: "galaga", username: username});
    });

    socket.on('clientOnline', function(data) {
        updatePlayers(data.players);
    });

    socket.on('clientOffline', function(data) {
        updatePlayers(data.players);
    });

    socket.on('startGame', function(data) {
        console.log("start game");
        startGame();
    });

    socket.on('updateObjects', function(data) {
        game.objects = data.objects;
        game.correctObjects();
    });

    socket.on('initWorld', function(data) {
        initWorld(data);
        $('#connecting-layer').fadeOut('fast');
        $('#serverControl').show();
    });


}

function initWorld(data) {
    updatePlayers(data.players);
}

/*
 * For preloading images on cache
 */
function preloader() {

    $("#progress-bar").progressbar({value: percentage});

    // set image list
    var images = new Array();
    images['ship'] = "images/spaceship.png";
    images['fireball'] = "images/fireball.png";
    images['rock'] = "images/rock.png";
    images['rock-explosion'] = "images/rock-explosion.png";

    var sounds = Array();
    sounds['backMusic'] = "sounds/game-song1.mp3";
    sounds['weapon-fire'] = "sounds/laser.ogg";
    sounds['rock-explosion'] = "sounds/bigboom.wav";
    sounds['ship-explosion'] = "sounds/ship-explode.wav";
    for (var key in sounds) {
        var soundObj = new Audio();
        soundObj.src = sounds[key];
        soundBuffer[key] = soundObj;
    }


    var imageslength = 4;
    var count = 1;
    // start preloading
    for (var key in images) {
        var imgObj = new Image();
        imgObj.src = images[key];
        imageBuffer[key] = imgObj;
        var imageBufferLength = imageBuffer.length;
        percentage = ((count * 100) / imageslength);
        $('#progress-bar').progressbar({value: percentage});
        count++;
    }

    $("#loading-layer").hide();

}


function addPoints() {
    points += 10;
    updatePointsBoard(points);
}

$(document).keydown(function(e) {
    if (game.status == 'running') {
        var value = game.sampleUserInput(e.keyCode);
        if (value) {
            game.handleInput({type: 'keyboard', player: username, value: value, status: 'active'});
        }
    }
});

var keymapArrows = {left: 37, up: 38, right: 39, down: 40, shoot: 70};
var keymapAsd = {left: 65, up: 87, right: 68, down: 83, shoot: 70};

function startGame() {
    console.log("start local game");
    if (!game.status == 'running') {
        $('#space').pan({fps: 30, speed: 3, dir: 'down', depth: 10});
        game.status = 'running';
        console.log("game running");
        game.run();
        socket.emit('startGame', {player: username});
    } else {
        console.log("game was started");
        game.status = 'running';
        //$('#space').spStart();
        $('#space').pan({fps: 30, speed: 3, dir: 'down', depth: 10});
        game.run();
        socket.emit('startGame', {player: username});
    }
    soundBuffer['backMusic'].play();
}

function pauseGame() {
    soundBuffer['backMusic'].pause();
//    $('#space').spStop();
    game.stop();
    socket.emit('stopGame', {gameStatus: 'running'});
}

function gameOver() {
    $("#pointsToUser").html(points);

    $("#game-over").dialog({
        modal: true,
        title: 'Game over',
        buttons: {"Ok": function() {
                rankUser();
            }}
    });

    soundBuffer['backMusic'].stop();
}



$(document).ready(function() {
    preloader();

    $.when(socketIOReady).done(function() {
        console.log("socket ready");
        $('#connecting-layer').hide();
        $('#connectBtn').show();
    });

});