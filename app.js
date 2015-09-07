/**
 * start pont.
 *
 * Author: youske@gmail.com
 */

var appconfig = require('./appconfig');
var path = require('path');

var express = require('express');
var session = require('express-session');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var multer = require('multer');
var multer_storage = multer.memoryStorage();
var logger = require('morgan');

var ECT = require('ect');
var RedisStore = require('connect-redis')(session);

// routing
var routes = require('./routes/index');
var restroutes = require('./routes/rest');

var debug = require('debug')( appconfig.app_name );

var app = express();
var env = process.env.NODE_ENV || 'development';

var CACHE_TIME=appconfig.cache_expire_time;

// session
app.use( session({
  secret: "nodzo",
  resave: false,
  saveUninitialized: true,
  store: new RedisStore({host:'localhost',port:6379}),
  cookie: {
    maxAge: new Date( Date.now() + 1000 * 60 * 24 * 30),
    httpOnly: false,
    secure: true
  }
}));

// multer setup
app.use( multer({
    dest: './uploads',
    storage: multer_storage
}).single('imagedata') );

// ect setup
app.engine( 'ect', ECT( { watch: true, root: path.join(__dirname,'views'), ext:'.ect'} ).render );
app.set('view engine', 'ect');

// all environments
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public'),{ maxAge: CACHE_TIME }));
app.use( '/bower_components', express.static(path.join(__dirname, '/bower_components'),{ maxAge: CACHE_TIME }));

// routing URL bind
app.use('/',routes);
app.use('/rest',restroutes);

// error page
app.use( function(req,res,next) {
    res.send(400, 'Send cant find ');
});

// internal error page
app.use( function(err, req, res, next) {
    if(err){ console.log( err.stack ); }
    res.send(500, '500 error');
});

app.set('port', process.env.PORT || appconfig.service_port);

var server = app.listen( app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});










// socket.IO
var redis = require('redis');
var socketRedis = require('socket.io-redis');

var socketIO = require('socket.io');
var io = socketIO.listen( server );
var sopt = {
  'pub': {
    host:'localhost',
    port:6379
  },
  'sub': {
    host:'localhost',
    port:6379
  },
  'client': {
    host:'localhost',
    port:6379
  }
};

io.adapter( socketRedis( sopt.client ) );
require('./sockets')(io);

console.log("starting server. Port:"+appconfig.service_port);

module.exports = app;
