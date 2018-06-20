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

    var gSensors = $.ajax({
        url: "./home/resources/sensorData.json",
        async: false,
        success: function(res) {
          return res
            }
      }).responseJSON

      var tiles = L.esri.basemapLayer("Topographic");

      var sensorMap = L.map('sensormap', {
        center: [gSensors[0].Latitude, gSensors[0].Longitude],
        zoom: 5,
        layers: [tiles],
        maxzoom: 22,
        maxNativeZoom: 18
      });

      // $scope.sensorMap = sensorMap;

      var basemap = {
        "Topographic": tiles
      };

      L.control.layers(basemap).addTo(sensorMap);

      var markers = new L.markerClusterGroup(); //clustering function

      var markerList = [];

      for (var i = 0; i < gSensors.length; i++) {
          var marker = L.marker(L.latLng(parseFloat(gSensors[i].Latitude), parseFloat(gSensors[i].Longitude)));
          marker.bindPopup(gSensors[i].Title);
          markerList.push(marker);
        }
        markers.addLayers(markerList);
        sensorMap.addLayer(markers);
  }])

  .controller('chart_controller', ['$scope', '$http', function($scope, $http) {
    var script = document.createElement('script');
    var url = ['https://www.googleapis.com/fusiontables/v2/query?'];
    url.push('sql=');
    var query = "SELECT * FROM 1Jtg_LywbCaFVZ6_LDaUZfytZDLB2DGEWxR6O-9AV  WHERE 'ID' IN ('1') order By 'Time(s)' ASC "; // Opposite LIKE '1'
    var encodedQuery = encodeURIComponent(query);
    url.push(encodedQuery);
    url.push('&callback=GetDataFT'); //Calls the function after receiving data from Fusion Table
    url.push('&key=AIzaSyCoC9A3WgFneccRufbysInygnWrhCie-T0');
    script.src = url.join('');
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);


    var PointsToPlot = [];
    function GetDataFT(data){
    	//debug
    	console.log( data);
    	var rows = data['rows'];

    	PointsToPlot = [];


    	for (var i in rows) {
    		// Hold X and Y
    		var chartValue = [];

    		var Temperature = parseFloat(rows[i][0]);
    		var Relat_Humid = parseFloat(rows[i][1]);
    		var Time = parseFloat(rows[i][6]);

    		chartValue.push(Time);
    		chartValue.push(Temperature);
    		chartValue.push(Relat_Humid);
    		PointsToPlot.push(chartValue);

    	}
    	console.log( PointsToPlot );
    }

    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawChart);


    function drawChart(x) {
    	if (x != 1){
    		//====================== CHART PART ======================//
    		var data = new google.visualization.DataTable();
    		data.addColumn('number', 'X');
    		data.addColumn('number', 'Temperature');
    		data.addColumn('number', 'Relative Humidity');

    		data.addRows(PointsToPlot)

    		var options = {
    			//title: 'Company Performance',
    			//legend: { position: 'bottom' },
    			curveType: 'function',
    			hAxis: {
    				title: 'Time',
    				logScale: false
    			},
    			/*
    			vAxis: {
    			  title: 'Popularity',
    			  logScale: false
    			},
    			*/
    			explorer: {
    				actions: ['dragToZoom', 'rightClickToReset'],
    				axis: 'horizontal',
    				keepInBounds: true,
    				maxZoomIn: 4.0},
    			colors: ['#a52714', '#097138']
    		};

    		var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    		chart.draw(data, options);
    	}else{
    		//====================== FT PART ======================//
    		var script = document.createElement('script');
    		var url = ['https://www.googleapis.com/fusiontables/v2/query?'];
    		url.push('sql=');
    		var query = "SELECT * FROM 1Jtg_LywbCaFVZ6_LDaUZfytZDLB2DGEWxR6O-9AV  WHERE 'ID' LIKE '1' order By 'Time(s)' ASC ";
    		var encodedQuery = encodeURIComponent(query);
    		url.push(encodedQuery);
    		url.push('&callback=GetDataFT'); //Calls the function after receiving data from Fusion Table
    		url.push('&key=AIzaSyCoC9A3WgFneccRufbysInygnWrhCie-T0');
    		script.src = url.join('');
    		var body = document.getElementsByTagName('body')[0];
    		body.appendChild(script);

    		//====================== CHART PART ======================//
    		var data = new google.visualization.DataTable();
    		data.addColumn('number', 'X');
    		data.addColumn('number', 'Temperature');
    		data.addColumn('number', 'Relative Humidity');

    		data.addRows(PointsToPlot)

    		var options = {
    			//title: 'Company Performance',
    			//legend: { position: 'bottom' },
    			curveType: 'function',
    			hAxis: {
    				title: 'Time',
    				logScale: false
    			},
    			/*
    			vAxis: {
    			  title: 'Popularity',
    			  logScale: false
    			},
    			*/
    			explorer: {
    				actions: ['dragToZoom', 'rightClickToReset'],
    				axis: 'horizontal',
    				keepInBounds: true,
    				maxZoomIn: 4.0},
    			colors: ['#a52714', '#097138']
    		};

    		var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    		chart.draw(data, options);

    	}
    }

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
