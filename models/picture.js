/**
 * Model: picture
 *
 * Author youske@gmail.com
 *
 */

var fs = require('fs');
var path = require('path');
var mimetype = require('mime-types');
var nasync = require('neo-async');
var async = require('async');
var sha1 = require('sha1');
var dateformat = require('dateformat');


// 画像の変換にImageMagickを利用する場合 (GraphicsMagick)
var gm = require('gm').subClass({ imageMagick: true });


//
exports.getformats = function (prefix, upfile, host, ua, accesstime ) {
  var base = prefix + sha1( upfile.originalname + host + accesstime );
  var dt = dateformat( accesstime, "yyyymmdd" );
  var pathstr = host + '/' + dt ;
  var extension = mimetype.extension( upfile.mimetype );
  var thumbext = extension;
  if(extension =='png' || extension == 'jpg') {
    thumbext = 'png';
  }

  //exception text mime type Geepluzo
  if(ua == 'Geepluzo/1.0' ) {
    extension = 'png';
    thumbext = 'png';
  }

  return {
    'originalname': upfile.originalname,
    'mimetype': upfile.mimetype,
    'encoding': upfile.encoding,
    'extension': extension,
    'size': upfile.size,
    'truncated': upfile.truncated,
    'domain': host,
    'path': pathstr,
    'base': base,
    'date': dateformat( accesstime, "yyyymmddhhMMss" ),
    'infourl': '/info/' + base,
    'imageurl': '/uploads/' + pathstr + '/' + base + "." + extension,
    'thumbnailurl': '/uploads/' + pathstr + '/' + base + '_tn.' + thumbext
  };
};

//
exports.value = function ( rcli, key, callback ) {
  if (!rcli) return;

  var arr = [];
  rcli.hgetall( key, function( err, obj ) {
    if( err ) { console.log( 'picture.value:' + err ); throw err; }
    arr.push( obj );
  });
};

//
// keyパターンに該当する指定フィールドを取得
//
exports.get = function( rcli, hstr, fields, callback ) {
  if(!rcli) return;

  var arr = [];
  nasync.waterfall([
    function(nextProc) {
      rcli.keys( hstr, nextProc );
    },
    function(allkeys, nextProc) {
      nasync.each( allkeys, function(i,cb) {
        rcli.hmget( i, fields, function(err,obj){
          if( err ) { console.log("hmget: "+err); throw err; }
          var dict={};
          for ( var cnt=0;cnt<fields.length;cnt++) {
            dict[ fields[cnt] ] = obj[cnt];
          }
          arr.push( dict );
          cb();
        });
      },function(err) {
        if( err ) throw err;
        nextProc();
      });
    }
  ],function( err, result ){
     console.log( "get length="+arr.length );
     callback( err, arr );
  });

};

//
// member.dateによるソート
//
exports.sortDate = function( arr, asc, callback ) {
  if(!arr) callback( new Error('sortDate'), null );

  var order = (asc===true) ? 1 : -1;
  async.sortBy( arr, function(obj,done) {
    var xx = parseInt( obj.date, 10 );
    done( null, obj.date*order );
  },
  function(err, result) {
    callback( err, result );
  });
};


// データを追加
exports.insert = function( rcli, datas, bimg, rsiz, callback ) {
  if (!rcli || !datas || !datas.base || !callback) {
    console.log('error='+datas);
    callback( new Error('picture.insert invalid params') );
  }

  // domain directory
  var domainDirectory = './public/uploads/' + datas.domain;
  if( !fs.existsSync( domainDirectory ) ) {
    fs.mkdirSync( domainDirectory );
  }
  // date directory
  var dateDirectory = './public/uploads/' + datas.path;
  if( !fs.existsSync( dateDirectory ) ) {
    fs.mkdirSync( dateDirectory );
  }

  nasync.parallel([

     // png,jpeg等のtumbnail
     function( nextProc ) {

      gm( bimg ).format( function(err,value) {
        var frmstr = value.toLowerCase();
        if( frmstr == 'png' || frmstr == 'jpeg' ) {
          console.log("thumb format "+frmstr);

          gm( bimg ).size( function(err,value) {
            if( err ){ console.log("picture.sizecheck:" + err); throw err; }
            console.log(value);
            var sw = ( value.width > rsiz ) ? rsiz : value.width;
            gm( bimg ).thumb(sw,value.height, './public'+datas.thumbnailurl, 100, function(err2) {
              if( err2 ){ console.log("picture.thumb:" + err2); throw err2; };
              nextProc( err );
            });

          });
        } else {
          nextProc(err);
        }

      });

    },

    // それ以外のthumbnail
    function( nextProc ) {
      gm( bimg ).format( function(err,value) {
        var frmstr = value.toLowerCase();
        if( frmstr == 'png' || frmstr == 'jpeg' ) {
          nextProc( null );
          return;
        }
        console.log("thumbetc format "+frmstr);
        var sw = ( value.width > rsiz ) ? rsiz : value.width;
        if( err ){ console.log("picture.thumb:" + err); throw err; };
        var dt=gm( bimg ).resize(sw).write('./public'+datas.thumbnailurl,function(err){
          if(err) { console.log(err); throw err; }
          nextProc( err );
        });
      });
    },

    // png jpegなどの一般的な画像ファイル
    function( nextProc ) {
      gm( bimg ).format( function(err, value ) {
        var frmstr = value.toLowerCase();
        if( frmstr == 'png' || frmstr == 'jpeg' ) {
          console.log("img format "+frmstr);
          gm( bimg ).type('Optimize').write( './public'+datas.imageurl, function(err) {
            if( err ){ console.log("picture.write image:" + err); throw err; }
            nextProc( err );
          });
        }else {
          nextProc(err);
        }
      });

    },
    // それ以外
    function( nextProc ) {
      gm( bimg ).format( function(err, value ) {
        var frmstr = value.toLowerCase();
        if( frmstr == 'png' && frmstr == 'jpeg' ) {
          nextProc( err );
          return;
        }
        console.log('etc format='+frmstr);
        fs.writeFile('./public'+datas.imageurl,bimg, function(err) {
          if( err ){ console.log("file.write :" + err); throw err; }
          nextProc( err );
        });
      });
    },
    function (nextProc) {
      rcli.hmset(datas.base,datas,function(err){
        if(err){ console.log('picture.hmset error;' + err); throw err; }
        nextProc( err );
      });
    }
  ],function(err,result){
      if( err ){ console.log("picture.insert:" + err); throw err; }
      console.log('upload end');
      callback(err);
  });

};

exports.set = function(rcli,key,field,value, callback){
  rcli.hset( key, field, value, function(err) {
    if(err) console.log("picture.set:"+err);
    callback(err);
  });
};

// sever image file
exports.getimage = function( rcli, key, type, callback ) {
  var target = (type == "thumbnails" ) ? "thumbnails" : "images" ;
  var targetcount = target + "count";
  nasync.waterfall([
    function(nextProc) {
      rcli.hmget( key, [ target, 'mimetype' ], function( err, result ) {
        if(err){ console.log("picture.getimage:" + err); throw err; }
        nextProc( err, result );
      });
    },
    function( result, nextProc ) {
      rcli.hincrby( key, targetcount, 1, function(err) {
        if(err){ console.log( "picture.getimage:" + err ); throw err; }
        nextProc( err, result );
      });
    }
  ],function( err, result ){
    if(err){ console.log( 'picture.getimage error:' + err ); throw err; }
    callback( err, result );
  });
};
