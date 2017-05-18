/**
 * UserFactory belongs here
 */

angular
  .module('Codesmith.UserFactory', ['ngRoute'])
  .factory('UserFactory', function() {
      let newObj = {};
      newObj.name = 'Brian & Li';
      newObj.age = 28;
      return newObj;
  });

