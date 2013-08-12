var rankingModel = require("../models/RankingModel.js");

exports.index = function(req, res) {
    var page = {title: "Welcome"};
    res.render('room.html', {title: 'Route Separation Example', page: page});
};

exports.rankUser = function(req, res) {
    rankingModel.save({
        name: req.body.username,
        points: req.body.points
    });
    res.send(200);
};