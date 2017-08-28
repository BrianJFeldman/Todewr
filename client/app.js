const app = angular
  .module('myApp', [
    'ngRoute',
    'HomeController',
    'ListController',
    // 'UserFactory',
    'RequestFactory',
    'ngMaterial',
    'ngAria'
  ]);

app.config(configFunction);

function configFunction($routeProvider, $locationProvider) {

  $routeProvider
    .when('/', {
      templateUrl: './partials/home.html',
      controller: 'HomeController'
    })
    .when('/lists',{
      templateUrl: './partials/lists.html',
      controller:'ListController'
    });
}
