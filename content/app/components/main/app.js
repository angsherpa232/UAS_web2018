var uas2018 = angular.module('uas2018', ['ngRoute']);

uas2018.config(['$routeProvider', function ($routeProvider){
	$routeProvider
	.when('/3D', {
		templateUrl: './content/app/components/3d/3d_map.html',
		controller: 'uas2018_controller'
	})
	.when('/home', {
		templateUrl: './content/app/components/home/home.html',
		controller: 'uas2018_controller'
	})
	.when('/map', {
		templateUrl: './content/app/components/map/map_2d.html',
		controller: 'uas2018_map_controller'
	})
	.otherwise({
		redirectTo: '/home'
	})
}]);

uas2018.controller('uas2018_controller',['$scope', function ($scope){
	console.log('Hello modify me as you want. Happy coding for UAS 2018');
}]);

uas2018.controller('uas2018_map_controller',['$scope', function($scope){
	console.log('This is new controller');

  var topo = L.esri.basemapLayer("Topographic");


  var east_guard = L.marker([51.945227, 7.572934]).bindPopup('I am a east guard.');
      north_east_guard = L.marker([51.945031, 7.572239]).bindPopup('I am a north east guard.'),
      west_guard    = L.marker([51.944450, 7.572828]).bindPopup('I am a west guard.'),
      west_south_guard    = L.marker([51.944867, 7.573800]).bindPopup('I am a west south guard.');

  var guards = L.layerGroup([east_guard, north_east_guard, west_guard, west_south_guard]);

    // more than one service can be grouped together and passed to the control together
  var darkgrey = L.esri.basemapLayer("DarkGray");

  var imagery = L.esri.basemapLayer("Imagery");

		//Main map object
    var map = L.map('map', {
        center: [51.944990, 7.572810],
        zoom: 17,
        layers: [imagery],
				maxzoom:22,
				maxNativeZoom: 18
    });

		//Default base layers when the app initiates
    var baseLayers = {
        "Imagery": imagery,
        "Topographic": topo,
				"Gray": darkgrey
    };

		$scope.flightPlanOnEachFeature = function (feature, layer) {
			// console.log(feature.properties.Altitude)
			var popupContent = "Altitude: " + feature.properties.Altitude;
			layer.bindPopup(popupContent);
		};

		$scope.getColor = function (x) {
			return x < 46 ? '#ffeda0':
			x < 48.1 ? '#feb24c':
			x < 50.8 ? '#f03b20':
			'#f01010';
		};

		//Flight plan from last year
		var flightPlanLayer = L.esri.featureLayer({
			url: "https://services1.arcgis.com/W47q82gM5Y2xNen1/arcgis/rest/services/FightPath/FeatureServer/1",
			style: function (feature) {
				return {
					"color": $scope.getColor(feature.properties.Altitude),
					"opacity": 1,
				};
			},
			onEachFeature: $scope.flightPlanOnEachFeature
		});

		//Add here if additional overlays are to be added
    var overlays = {
        "Guards": guards,
				"Flight plan": flightPlanLayer
    };

		//Initiate layers control method and add to map
    L.control.layers(baseLayers, overlays).addTo(map);
}]);
