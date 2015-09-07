/**
 * gulp setting file
 *
 * Author: youske@gmail.com
 */
var gulp = require( 'gulp' );
var livereload = require( 'gulp-livereload' );
var supervisor = require( 'gulp-supervisor' );
var reloadserver = require('tiny-lr')();

var LR_PORT = 35729;

// serve livereload

gulp.task( 'serve', function() {
  console.log('start livereload');
  reloadserver.listen( LR_PORT, function(err) {
    if(err) console.log(err);

    gulp.watch([
      'public/*',
      'views/*'
    ]).on('change', function(file){
        console.log('change:'+file.path);
        reloadserver.changed(file.path);
    });
  });
});


// supervisor
gulp.task('supervisor', function() {
  console.log('start supervisor');
  supervisor( "./bin/www", {
    debug: true,
    args: [],
    watch: [ 'models', 'dataformats','routes' ],
    ignore:[ 'node_modules', 'bower_components' ],
    extensions: ['js', 'json'],
    pollInterval: 500,
    exec: 'node'
  });
});

gulp.task( 'default', ['supervisor','serve'] );
