'use strict';

/**
 * @ngdoc overview
 * @name bitcoin-price-demo
 * @description
 * # bitcoin-price-demo
 *
 * Main module of the application.
 */
var myapp = angular.module('bitcoin-price-demo', [
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ngMessages',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ui.bootstrap',
  'nvd3'
]);
myapp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/about', {
      templateUrl: 'views/about.html',
      controller: 'AboutCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});
// http://stackoverflow.com/questions/17144180/angularjs-loading-screen-on-ajax-request
myapp.directive('loading', ['$http' ,function ($http) {
  return {
    restrict: 'A',
    link: function (scope, elm) {
      scope.isLoading = function () {
        console.log('Loading: '+$http.pendingRequests.length);
        return $http.pendingRequests.length > 0;
      };

      scope.$watch(scope.isLoading, function (v) {
        if(v){
          elm.show();
        }else{
          elm.hide();
        }
      });
    }
  };
}]);