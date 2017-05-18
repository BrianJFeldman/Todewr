const app = angular
  .module('myApp', [
    'ngRoute',
    'Codesmith.HomeController',
    'Codesmith.ListController',
    'Codesmith.UserFactory',
    'Codesmith.RequestFactory',
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
