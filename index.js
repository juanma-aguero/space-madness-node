var express = require('express');
var app = express();
var siteController = require('./controllers/HomeController');
var server = require('http').createServer(app);
server.listen(3000);

var realtime = require('./lib/realtime_1');

/*** setup ***/
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.use(express.logger('dev'));
app.use(express.bodyParser());

/*** routes ***/
// homepage
app.get('/', siteController.index);
// ranking
app.post('/rankUser', siteController.rankUser);


realtime.start(server);

/*** port ***/
//app.listen(3000);
console.log('Express listening on port 3000');