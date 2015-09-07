/**
 * routes
 *
 * Author: youske@gmail.com
 */
var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');

var express = require('express');
var socketIO = require('socket.io');
var multer = require('multer');
var router = express.Router();
var redis = require('redis');

var mq = require('../models/messagequeue');
var picture = require('../models/picture');
var appconfig = require('../appconfig');


// upload keyname prefix
var UPLOADPREFIX='nz_';

// thumbnail picture size default
var THUMBNAILS_WIDTHSIZE=240;

var g_rcli = redis.createClient();


// root
router.get('/',function(req,res,next) {
   res.render( 'index', {title:'upload list', list: req.sort_res_data} );
});


//
router.get('/list',function(req,res,next) {
  req.rcli = g_rcli;
  var fields = [
    'infourl',
    'originalname',
    'thumbnailurl',
    'date'
  ];
  picture.get( req.rcli, UPLOADPREFIX+'*', fields, function( err, data ) {
    if(err) { console.log("/="+err); throw err; }

    picture.sortDate( data, false, function(err,result) {
      if( err ){ console.log("sort:"+err); throw err;}
      req.res_data = result;
      next();
    });
  });

},
function(req,res,next) {
  res.render( 'list', {title:'upload list', list: req.res_data} );
});


// upload webinterface
router.get('/upload',function(req,res) {
  res.render( 'upload', {title: 'upload'} );
});


// upload proc
//
// サーバごとにファイルを区分して保存
//
router.post('/upload',function(req,res,next) {
  req.rcli = g_rcli;
  var host = sha1( req.header('host') );
  var ua = req.headers['user-agent'];
  req.upload_datas = picture.getformats( UPLOADPREFIX, req.file, host, ua, req._startTime );
  picture.insert( req.rcli, req.upload_datas, req.file.buffer, THUMBNAILS_WIDTHSIZE, function( err ) {
    if(err){ console.log("error upload " + err); throw err; }
    next();
  });
},
function( req, res, next ) {
  var imgUrl = req.upload_datas.imageurl;
  var domain = "http://" + req.header('host');
//  req.rcli.end();
  res.send( domain + imgUrl );
});


// gyazo post
router.post('/gyazoup',function(req, res, next) {
  req.rcli = g_rcli;
  var host = sha1( req.header('host') );
  var ua = req.headers['user-agent'];
  req.upload_datas = picture.getformats( UPLOADPREFIX, req.file, host, ua, req._startTime );
console.log( JSON.stringify(req.upload_datas) );
  var buf = new Buffer ( req.file.buffer, 'base64' );
  //delete req.file.imagedata;
  picture.insert( req.rcli, req.upload_datas, buf, THUMBNAILS_WIDTHSIZE, function( err ) {
    if(err){ console.log( "error gyazoup " + err); throw err; }
    delete buf;
    next();
  });

},function(req, res, next) {
  var imgUrl = req.upload_datas.imageurl;
  var domain = "http://" + req.header('host');
  mq.setMessage( req.rcli, req.upload_datas, function() {
//    req.rcli.end();
    delete req.upload_datas;
    res.send( domain + imgUrl );
  });
});

// infomation
router.get('/info/:nm', function( req, res, next ) {
  req.rcli = g_rcli;
  var key = req.param('nm');

  req.rcli.hgetall( key, function( err, obj ) {
    if( err ) { console.log( "get:" + err ); throw err; }
    req.infomation_data = obj;
    res.render( 'info', {title: 'info', data:obj} );
  });
});

//
router.get('/info',function(req,res,next) {
  var dat = (req.infomation_data) ? req.infomation_data : [];
  res.render( 'info', {title: 'info', data:dat} );
});

// images serve
router.get('/images/:nm', function(req,res,next) {
  req.rcli = g_rcli;
  var inm = req.param('nm');

  picture.getimage( req.rcli, inm, 'images', function(err,result) {
    if(err){ console.log( 'image serve:' + err ); throw err; }
    var buffer = new Buffer( result[0], 'base64' );
    res.type( result[1] );
    res.end( buffer, 'binary' );
  });
});

// thumbnail serve
router.get('/thumbnails/:nm', function(req,res,next) {
  req.rcli = g_rcli;
  var inm = req.param('nm');

  picture.getimage( rcli, inm, 'thumbnails', function(err, result) {
    if(err){ console.log('thumbnails:' + err ); throw err; }
    var buffer = new Buffer( result[0], 'base64' );
    res.type( result[1] );
    res.end( buffer, 'binary' );
  });
});

module.exports = router;
