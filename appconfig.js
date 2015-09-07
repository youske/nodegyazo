/**
 *  application config
 *
 *  Author: youske@gmail.com
 */

module.exports = {
  app_name: 'nodzo',
  service_port: 8080,
  cache_expire_time: 86400000,

  socket_emitter: {
    host: '127.0.0.1', port: 6379
  }

};
