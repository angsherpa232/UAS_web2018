// declare modules
/* var key = angular.module('keys',['keys']); */

var uas2018 = angular.module('uas2018', []);

uas2018.controller('uas2018_controller', ['$scope', '$location', '$rootScope', function($scope, $location, $rootScope) {
  console.log('Hello I am main controller for now. Modify me as you want. Happy coding for UAS 2018')
  if ($location.path() != '/login') {
    $scope.$on('$viewContentLoaded', function() {
      $('#menu').removeClass('cloak')
      $('#footer').removeClass('cloak')
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

  // .factory('logged',
  //     ['$rootScope',
  //     function ($rootScope) {
  //
  //       }])


  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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

      .when('/sensor', {
        controller: 'sensor_controller',
        templateUrl: './home/views/sensor.html'
      })

      .otherwise({
        redirectTo: '/'
      });
  }])


  .controller('uas2018_map_controller', ['$scope', function($scope) {
    console.log('This is map controller');

    var topo = L.esri.basemapLayer("Topographic");

    //Dummy markers for testing phase
    var east_guard = L.marker([51.945227, 7.572934]).bindPopup('I am a east guard.');
    north_east_guard = L.marker([51.945031, 7.572239]).bindPopup('I am a north east guard.'),
      west_guard = L.marker([51.944450, 7.572828]).bindPopup('I am a west guard.'),
      west_south_guard = L.marker([51.944867, 7.573800]).bindPopup('I am a west south guard.');

    var guards = L.layerGroup([east_guard, north_east_guard, west_guard, west_south_guard]);

    // more than one service can be grouped together and passed to the control together
    var darkgrey = L.esri.basemapLayer("DarkGray");

    var imagery = L.esri.basemapLayer("Imagery");

    // Main map object
    var map = L.map('map', {
      center: [51.944990, 7.572810],
      zoom: 17,
      layers: [imagery],
      maxzoom: 22,
      maxNativeZoom: 18
    });

    // Default base layers when the app initiates
    var baseLayers = {
      "Imagery": imagery,
      "Topographic": topo,
      "Gray": darkgrey
    };


    $scope.flightPlanOnEachFeature = function(feature, layer) {
      // console.log(feature.properties.Altitude)
      var popupContent = "Altitude: " + feature.properties.Altitude;
      layer.bindPopup(popupContent);
    };

    $scope.getColor = function(x) {
      return x < 46 ? '#ffeda0' :
        x < 48.1 ? '#feb24c' :
        x < 50.8 ? '#f03b20' :
        '#f01010';
    };

    //Flight plan from last year
    var flightPlanLayer = L.esri.featureLayer({
      url: "https://services1.arcgis.com/W47q82gM5Y2xNen1/ArcGIS/rest/services/Flight_Path_40m/FeatureServer/0",
      style: function(feature) {
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


  .controller('sensor_controller', ['$scope', '$http', function($scope, $http) {
    console.log('This is sensor controller');

    // Sensor data integration

    var tiles = L.esri.basemapLayer("Topographic");

    var sensorMap = L.map('sensormap', {
      center: [51.944649, 7.572640],
      zoom: 12,
      layers: [tiles],
      maxzoom: 22,
      maxNativeZoom: 18
    });

    // $scope.sensorMap = sensorMap;

    var basemap = {
      "Topographic": tiles
    };

    L.control.layers(basemap).addTo(sensorMap);

    var marker_id;

    var dataURL = "./home/resources/markers_project.geojson"

    var jsonData = $.ajax({
      url: dataURL,
      async: false,
      success: function(res) {
        return res
      }
    }).responseJSON

    // var gSensors = jsonData.features
    //
    // console.log(gSensors[0].geometry)

    var markers = L.geoJson(jsonData, {
      pointToLayer: function(feature, latlng) {
        var marker = L.marker(latlng);
        //marker.bindPopup(feature.properties.id + '<br/>' + feature.properties.geoid);
        return marker;
      },
      onEachFeature: function(feature, layer) {
        layer.on('click', function(e) {
          //console.log(feature.properties.id);

          //global variable receives the id of the marker clicked by the user
          marker_id = feature.properties.id

          //Run the function that request the data based on the marker clicked by the user
          request_fusiontable_data(marker_id);

          //ensure that all times a marked is clicked,
          //all the checkbox from the class ".cb_chart_var" initiate as checked
          $(".cb_chart_var").prop("checked", true)
        }); //end Event listener 'click' for the marker
      } //end onEachFeature
    })

    //creates a cluster object
    var clusters = L.markerClusterGroup();

    //Add the variable that contains all the markers to the cluster object
    clusters.addLayer(markers);

    //Add the clusters to the map
    sensorMap.addLayer(clusters);

    //Centralize and zoom the map to fit all the markers in the screen, automatically.
    sensorMap.fitBounds(markers.getBounds());

    console.log(markers)


    // $.getJSON(dataURL,function(data){
    //
    // 	  //add all the marker in one variable containing all the functionalities for them.
    // 	  var markers =   L.geoJson(data,{
    // 	  pointToLayer: function(feature,latlng){
    // 		var marker = L.marker(latlng);
    // 		//marker.bindPopup(feature.properties.id + '<br/>' + feature.properties.geoid);
    // 		return marker;
    //   },
    //   onEachFeature: function (feature, layer) {
    // 	     layer.on('click', function (e) {
    //
    // 		         //console.log(feature.properties.id);
    // 		         //global variable receives the id of the marker clicked by the user
    // 		          marker_id = feature.properties.id
    //
    //     				 //Run the function that request the data based on the marker clicked by the user
    //     				 // request_fusiontable_data(marker_id);
    //
    //     				 //ensure that all times a marked is clicked,
    //     				 //all the checkbox from the class ".cb_chart_var" initiate as checked
    //     				 $(".cb_chart_var").prop("checked", true)
    // 	      });   //end Event listener 'click' for the marker
    //      }    //end onEachFeature
    //   });
    //   var clusters = L.markerClusterGroup();
    //
    //   //Add the variable that contains all the markers to the cluster object
    //   clusters.addLayer(markers);
    //
    //   //Add the clusters to the map
    //   map.addLayer(clusters);
    //
    //   //Centralize and zoom the map to fit all the markers in the screen, automatically.
    //   map.fitBounds(markers.getBounds());
    // })
    // console.log(gSensors)
    //
    // console.log(gSensors.features.length)



    // var markers = new L.markerClusterGroup(); //clustering function
    //
    // var markerList = [];
    //
    // for (var i = 0; i < gSensors.length; i++) {
    //   var marker = L.marker(L.latLng(parseFloat(gSensors[i].geometry.coordinates[1]), parseFloat(gSensors[i].geometry.coordinates[0])));
    //   marker.bindPopup(gSensors[i].properties.NamePlace);
    //   markerList.push(marker);
    // }
    // markers.addLayers(markerList);
    // sensorMap.addLayer(markers);
  }])



  .run(['$rootScope', '$location', '$cookieStore', '$http',
    function($rootScope, $location, $cookieStore, $http) {
      // keep user logged in after page refresh

      $rootScope.globals = $cookieStore.get('globals') || {};
      if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
      }

      $rootScope.$on('$locationChangeStart', function(event, next, current) {
        // redirect to login page if not logged in

        if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
          $location.path('/login');

        }
      });


    }
  ]);
