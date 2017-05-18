angular
  .module('Codesmith.ListController', ['ngRoute'])
  .controller('ListController', ListController);

function ListController($scope,UserFactory) {
  console.log($scope)
}