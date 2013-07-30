var mongoose = require('mongoose');
mongoose.connect("mongodb://testspace:ironman30@dharma.mongohq.com:10022/space-madness");

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));


var userSchema = mongoose.Schema({
    name: "string",
    points: "string"
});
var User = mongoose.model('user', userSchema);


exports.save = function(userInstance) {
    var user = new User({name: userInstance.name, points: userInstance.points});
    user.save(function(err, user) {
        if (err) {
            return console.log("fail on save.");
        } else {
            return console.log("Saved:" + user.name);
        }
    });
};
exports.findAll = function() {
    User.find(function(err, users) {
        if (err) {
            return console.log("Failed find.");
        }
        return users;
    })
};
