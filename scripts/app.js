// declare modules
/* var key = angular.module('keys',['keys']); */
var uas2018 = angular.module('uas2018', []);

uas2018.controller('uas2018_controller', ['$scope', '$location', function($scope, $location) {
  console.log('Hello I am main controller for now. Modify me as you want. Happy coding for UAS 2018')
  if ($location.path() != '/login') {
    $scope.$on('$viewContentLoading', function() {
      console.log('wank')
      console.log($('#menu'))
      $('#menu').removeClass('cloak')
    });
  }

}]);


angular.module('Authentication', []);
angular.module('Home', []);

angular.module('UAS_2018', [
    'Authentication',
    'Home',
    'ngRoute',
    'ngCookies',
    'uas2018'
])


.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
  // $locationProvider.hashPrefix('');
    $routeProvider
        .when('/login', {
            controller: 'LoginController',
            templateUrl: './authentication/views/login.html'
        })

        .when('/', {
            controller: 'HomeController',
            templateUrl: './home/views/home.html'
        })

        .when('/processing', {
            templateUrl: './home/views/processing.html'
        })

        .when('/map', {
            controller: 'uas2018_map_controller',
            templateUrl: './home/views/map_2d.html'
        })

        .when('/3D', {
            controller: 'HomeController',
            templateUrl: './home/views/3d_map.html'
        })

        .otherwise({ redirectTo: '/' });
}])


.controller('uas2018_map_controller',['$scope', function($scope){
  console.log('This is map controller');

  var topo = L.esri.basemapLayer("Topographic");

//Dummy markers for testing phase
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
      url: "https://services1.arcgis.com/W47q82gM5Y2xNen1/arcgis/rest/services/UAS18_flight_path/FeatureServer",
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
}])



.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh

        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in

            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');

            }
        });
    }]);
