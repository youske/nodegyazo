'use strict';

angular.module('masonryTestMod',['wu.masonry','ngClipboard','ngToast'])
  .config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("/bower_components/zeroclipboard/dist/ZeroClipboard.swf");
  }]);

angular.module('masonryTestMod').controller( 'MainCtrl', function($scope,$http,$location,ngToast) {
  var fixport = ( $location.port() != 80 ) ? ":" + $location.port() : "" ;
  var fixURL = $location.protocol() + "://" + $location.host() + fixport;

  $scope.reloadUrl = "/rest/list";
  $scope.lists = [];
  
  $scope.reload = function( url ) {
    $http.get(url)
      .success(function(data) {
        $scope.lists = data;
        console.log($scope.lists);
      });
  };
  
  $scope.setup = function() {
    $scope.reload( $scope.reloadUrl );        
  };
  $scope.setup();

  $scope.getThumbnailUrl = function(obj) {
    return obj.thumbnailurl;
  };


  $scope.getImageUrl = function( obj ) {
    var urlstring = fixURL + obj.imageurl;
    return urlstring;
  };
 
  $scope.toastup = function( obj ) {
    ngToast.create( {
      content: "copy : " + fixURL + obj.imageurl,
      timeout: 1000,
      maxNumber: 1
    });
  };

  $scope.add = function( param ) {
    $scope.lists.unshift( param );
    ngToast.create({
        content: "image upload",
        timeout: 600,
        maxNumber: 1
    });
  };

 
});
