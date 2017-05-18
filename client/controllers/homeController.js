angular
  .module('Codesmith.HomeController', ['ngRoute'])
  .controller('HomeController', HomeController);

function HomeController($scope, $interval,$location, RequestFactory) {
  $scope.sendMessage = function () {
    let inp = {};
    console.log($scope)
    inp.number = $scope.phone;
    RequestFactory.sendMessage(inp, function (dbReturnData) {
      $scope.lists= [].concat(dbReturnData.data.lists);
       $location.path('/lists');
    })
  }
}
