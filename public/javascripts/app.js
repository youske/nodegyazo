angular.module('appMod',['famous.angular','ui.router','wu.masonry'])
 .config( function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/startpage");

  $stateProvider
    .state('startpage', {
      url: "/startpage",
      templateUrl: "startpage"
    })
    .state('state1', {
      url: "/state1",
      templateUrl: "state1",
      controller: "State1Ctrl"
    })
    .state('state2', {
      url: "/state2",
      templateUrl: "state2",
      controller: "State2Ctrl" 
    })
    .state("uisample", {
      url: "/uisample",
      templateUrl: "uisample",
      controller: "UISampleCtrl"
    })
    .state("pagetest", {
      url: "/pagetest",
      templateUrl: "pagetest",
      controller: "PageTestCtrl"
    })
    .state("animation", {
      url: '/animation',
      templateUrl: "animation",
      controller: "AnimationCtrl"
    })
    .state("picturepanel", {
      url: '/picturepanel',
      templateUrl: "picturepanel",
      controller: "PicturePanelCtrl"
    })
    .state("gridsample", {
      url: '/gridsample',
      templateUrl: "gridsample",
      controller: "GridSampleCtrl"
    })
 


});
