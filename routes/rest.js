/**
 * restroutes
 *
 * Author: youske@gmail.com
 */
var redis = require('redis');
var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');

var express = require('express');
var router = express.Router();

var multer = require('multer');

var appconfig = require('../appconfig');
var mq = require('../models/messagequeue');
var picture = require('../models/picture');


var UPLOADPREFIX='nz_';
var THUMBNAILS_WIDTHSIZE=240;
var LISTLIMIT=80;

var g_rcli = redis.createClient();


router.all('/list', function(req,res,next) {
  var rcli = g_rcli;
  var fields = [
    'thumbnailurl',
    'imageurl',
    'date'
  ];
  picture.get(rcli,UPLOADPREFIX+'*', fields, function(err,data) {
    if(err){ console.log("picture get:"+err); throw err; }
    picture.sortDate( data, false, function(err,rdata) {
      if(err){ console.log( err ); throw err; }
      var slarray = rdata.slice(0,LISTLIMIT);
      res.type( 'application/json' );
      res.end( JSON.stringify(slarray) );
    });
  });
});

router.get('/call',function(req,res,next) {
  console.log(  this );
   mq.setMessage( g_rcli, "index", function(err) {
     res.send("hoge");
   });
});



/*
// root
router.get('/',function(req,res,next) {
  var fields = [
    'infourl',
    'originalname',
    'imagescount',
    'thunbnailscount',
    'date'
  ];
  picture.get( g_rcli, UPLOADPREFIX+'*', fields, function( err, data ) {
    if(err){ console.log("inde page:"+err); throw err; }
    res.render( 'index', {title:'upload list', list: data} );
  });
});


// upload webinterface
router.get('/upload',function(req,res) {
  res.render( 'upload', {title: 'upload'} );
});


// upload proc
router.post('/upload',function(req,res,next) {
  var rcli = g_rcli;
  var upfile = req.files.imagedata;

  var datas = picture.getformats( UPLOADPREFIX, upfile, req._startTime );
  req.upload_datas = datas;
  console.log(datas);

  picture.insert( rcli, datas, upfile.buffer, THUMBNAILS_WIDTHSIZE, function( err ) {
    if( err ) console.log("error " + err);
    next();
  });
},
function( req, res, next ) {
  var imgUrl = req.upload_datas.imageurl;
  var domain = "http://" + req.header('host');
  res.send( domain + imgUrl );
});

// gyazo post
router.post('/gyazoup',function(req, res, next) {
  var rcli = g_rcli;
  var upfile = req.files.imagedata;

  var datas = picture.getformats( UPLOADPREFIX, upfile, req._startTime );
  datas.mimetype = 'image/png';
  datas.extension = 'png';

  req.upload_datas = datas;
  console.log( datas );

  var buf = new Buffer ( upfile.buffer, 'base64' );
  picture.insert( rcli, datas, buf, THUMBNAILS_WIDTHSIZE, function( err ) {
    if( err ){ console.log("gyazo post:" + err); throw err; }
    next();
  });

},function(req, res, next) {
  var imgUrl = req.upload_datas.imageurl;
  var domain = "http://" + req.header('host');
  res.send( domain + imgUrl );
});


// infomation
router.get('/info/:nm', function( req, res, next ) {
  var rcli = g_rcli;
  var key = req.param('nm');

  rcli.hgetall( key, function( err, obj ) {
    if( !err ) req.infomation_data = obj;
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
  var rcli = g_rcli;
  var inm = req.param('nm');

  picture.getimage( rcli, inm, 'images', function(err,result) {
    if( err ){ console.log( 'image serve:' + err ); throw err; }
    var buffer = new Buffer( result[0], 'base64' );
    res.type( result[1] );
    res.end( buffer, 'binary' );
  });
});

// thumbnail serve
router.get('/thumbnails/:nm', function(req,res,next) {
  var rcli = g_rcli;
  var inm = req.param('nm');

  picture.getimage( rcli, inm, 'thumbnails', function(err, result) {
    if(err){ console.log('getimage error:' + err ); throw err; }
    var buffer = new Buffer( result[0], 'base64' );
    res.type( result[1] );
    res.end( buffer, 'binary' );
  });
});


router.post('/postcomment/:nm', function( req, res, next ) {
  var inm = req.param('nm');
  next();

},function( req, res, next ){
//  picture.setcomment( rcli, )
  res.end('set comment ');
});

router.post('/comment/:nm', function( req,res,next ) {
  var rcli = g_rcli;
  var inm = req.param('nm');
  rcli.hset( inm, 'comment', req.param('comment') );
  next();
}, function(req,res,next) {
  res.end( 'set cooment' );
});

router.post('/gj/:nm', function(req,res,next) {
  var rcli = g_rcli;
  var inm = req.param('nm');
  rcli.hset( inm, 'gj', req.param('gj') );
  next();
},function( req,res,next) {
  res.end( 'set gj' );
});


router.post('/delete',function(req,res) {
  res.send('post');
});

router.get('/testview', function(req,res,next) {
  res.send('testview');
});
*/

module.exports = router;
