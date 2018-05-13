var uas2018 = angular.module('uas2018', ['ngRoute']);

uas2018.config(['$routeProvider', function ($routeProvider){
	$routeProvider
	.when('/3D', {
		templateUrl: './components/3d/3d_map.html',
		controller: 'uas2018_controller'
	})
	.when('/home', {
		templateUrl: './components/home/home.html',
		controller: 'uas2018_controller'
	})
	.otherwise({
		redirectTo: '/home'
	})
}]);

uas2018.controller('uas2018_controller',['$scope', function ($scope){
	console.log('Hello I am main controller for now. Modify me as you want. Happy coding for UAS 2018')
}]);
