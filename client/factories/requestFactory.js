/**
 * UserFactory belongs here
 */

angular
  .module('Codesmith.RequestFactory', ['ngRoute'])
  .factory('RequestFactory', function($http) {
    let newObj = {};
    newObj.fetch= function(cb){
        $http.get('http://slack-server.elasticbeanstalk.com/messages')
        .then(function(response){
        cb(response);
      }) 
      }
    newObj.sendMessage = function(inputObj,cb) {
      console.log(inputObj)
    $http.get('http://localhost:3000/getsms', inputObj)
     .then(function(response) {
       console.log(response);
       cb(response);
     })
    }
      return newObj;
  });

