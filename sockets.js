/**
 * websocket
 *
 * Author: youske miyakoshi
 *
 */

var redis = require('redis');
var mq = require('./models/messagequeue');


module.exports = function(io) {
  var rInstance = redis.createClient();

  setInterval( function() {
    var rcli = rInstance;
    mq.pull( rcli, function(err, data) {
      if(err) console.log( err );
      if( data ) {
        io.emit('change',data);
      }
    });
  },1000);


  //generic timer event
  setInterval(function(){
    io.emit('timer', new Date);
  }, 5000);
  
  io.sockets.on('connection', function(socket) {
    console.log('sessionID:', socket.handshake.sessionID);
  
    socket.on('cmessage', function(msg) {
      console.log("cmessage:"+msg);
      io.emit("cmessage",msg);
    });
  
    socket.on( 'disconnect', function() {
      console.log("user disconnect");
    });
  });

};
