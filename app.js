var uas2018 = angular.module('uas2018', ['ngRoute']);

uas2018.config(['$routeProvider', function ($routeProvider){
	$routeProvider
	.when('/3D', {
		templateUrl: 'views/3d_map.html',
		controller: 'uas2018_controller'
	})
	.when('/home', {
		templateUrl: 'views/home.html',
		controller: 'uas2018_controller'
	})
	.otherwise({
		redirectTo: '/home'
	})
}]);

uas2018.controller('uas2018_controller',['$scope', function ($scope){
	console.log('Hello modify me as you want. Happy coding for UAS 2018')
}]);
