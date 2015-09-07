/**
 *
 *
 *
 */


var fs = require('fs');
var path = require('path');

var async = require('async');
var sha1 = require('sha1');
var dateformat = require('dateformat');

var messageQueueKey='mq';

var TIMERANGE_REAL=600;
var TIMERANGE_SHORT=5000;
var TIMERANGE_LARGE=1000*60*3;



exports.timerange = {
  'real':{ prefix:'trr', time:600 },
  'short':{ prefix:'trs', time:5000 },
  'large':{ prefix:'trl', time:1000*60*3 },
  'huge':{ prefix:'trh', time:1000*60*15 }
};


//
exports.getformats = function (prefix, upfile, host, accesstime ) {


};

exports.setMessage = function(rcli, obj, callback) {
  if (!rcli) return;
  var jsstr = JSON.stringify(obj);
  rcli.lpush( messageQueueKey, jsstr, function( err ) {
    if( err ) { console.log( 'messagequeue.setMessage:' + err ); throw err; }
    callback(err);
  });
};

exports.pull = function(rcli,callback) {
  if (!rcli) return;

  rcli.llen( messageQueueKey, function(err, len) {
    if( err ){ console.log( "messagequeue.pull "+err ); throw err; }
    if( len<=0 ) {
      callback(err,null);
    } else {
      rcli.lpop( messageQueueKey, function( err, value ) {
        if( err ){ console.log( 'messagequeue.setMessage:' + err ); throw err; }
          callback(err,JSON.parse(value));
       });
    }
  });

}
