/**
 * UserFactory belongs here
 */

angular
  .module('RequestFactory', ['ngRoute'])
  .factory('RequestFactory', function($http) {
    let newObj = {};
    newObj.sendMessage = function(inputObj,cb) {
      // console.log(inputObj)
    $http.get('https://todewr.herokuapp.com/getsms', inputObj)
     .then(function(response) {
      //  console.log(response);
       cb(response);
     })
    }
      return newObj;
  });

