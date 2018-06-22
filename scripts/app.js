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
  .when('/about_us', {
      controller: 'HomeController',
      templateUrl: './home/views/about_us.html'
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
  //load google packages for the chart
  google.charts.load('current', {packages: ['corechart', 'line']});

  // Sensor data integration

  // var tiles = L.esri.basemapLayer("Topographic");
  //
  // var sensorMap = L.map('sensormap', {
  //   // center: [jsonData.features[0].geometry.coordinates[1], jsonData.features[0].geometry.coordinates[0]],
  //   zoom: 12,
  //   layers: [tiles],
  //   maxzoom: 22,
  //   maxNativeZoom: 18
  // });


  //Load the tiles for the map
  var sensorMap = new L.Map('sensormap');

  //Load the tiles for the map
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(sensorMap);


  // $scope.sensorMap = sensorMap;

  // var basemap = {
  //   "Topographic": tiles
  // };
  //
  // L.control.layers(basemap).addTo(sensorMap);

  // var gSensors = jsonData.features
  //
  // console.log(gSensors[0].geometry)

  var marker_id;

  var dataURL = "./home/resources/markers_project.geojson"

  var jsonData = $.ajax({
    url: dataURL,
    async: false,
    success: function(res) {
      return res
    }
  }).responseJSON

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

        $('#side_popup').show().css({
          left: ($('#side_popup').width())
        }).animate({left: 0}, 600);

        console.log("marker ID: "+marker_id)
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

  //event listener for hiding the sidebar_popup when the user clicks in the map
  sensorMap.on('click', function(e) {
    $('#side_popup').hide().css({
      right: ($('#side_popup').width())
    }).animate({left: 0	}, 600);
  });

  //Jquery function that map changes in the "#CheckboxDIV",
  //when a checkbox from the class ".cb_chart_var" is clicked
  $("#CheckboxDIV").on("change", ".cb_chart_var", function() {
    //for each click(change) in the checkbox a new requestion to the fusion table is made.
    request_fusiontable_data(marker_id);
  });




  function request_fusiontable_data(marker_id) {
    //Initiate all the checkbox, of the same class, already clicked.

    //Build the url for making a request to the Fusion Table API.
    //It'll create a HTML element: script.
    //And then adding the url for the request and append it to the body element. position [0]
    //All the time a new request is made, the old script is replaced by the new script.

    //Creates the HTML script element
    var script = document.createElement('script');

    //Start to build the URL
    var url = ['https://www.googleapis.com/fusiontables/v2/query?'];
    url.push('sql=');

    //Build the query
    var query = "SELECT * "
    query = query + " FROM 1xipnRPglhJ3vQ8RvNbxgKBVN7_Mh54V8J6XHxbce ";
    //Add to the query the WHERE clause to select the data according the marker clicker
    query = query + " WHERE 'geoid' IN (" + marker_id.toString() + ") ";
    //Put the results  in a structured ordered manner to be plotted in the chart
    query = query + " ORDER BY 'Time(s)' ASC ";

    //Encode the query and push to the array
    var encodedQuery = encodeURIComponent(query);
    url.push(encodedQuery);

    //Calls the callback function after receiving the queried data from Fusion Table
    //url.push('&callback=process_fusiontable_data');
    //add in the URL the Fusion table API key to be able to query information from it
    url.push('&key=AIzaSyCoC9A3WgFneccRufbysInygnWrhCie-T0');
    //Join all the array elements in one single string without spaces
    //and also add to script source element closing it.
    //It'll look likes: '<'script src="url_created"'>''<'/script'>'

    var queryData = $.ajax({
      url: url.join(''),
      async: false,
    }).responseText

    var queryJson = JSON.parse(queryData)

    process_fusiontable_data(queryJson)

    script.src = url.join('');

    //get the body element position[0] and append the script element to it.
    // var body = document.getElementsByTagName('head')[0];
    // body.appendChild(script);
    console.log(script)
  }

  function process_fusiontable_data(data) {
    //Process the data got from the fusion table

    var rows = data['rows'];
    console.log(rows);
    //Creates an empty array to insert the array of coordinates to be plotted in the chart
    var PointsToPlot = [];

    for (var i in rows) {
      //Variable that holds each coordinate to be plotted in the chart
      var coordinates = [];

      //Based on the fusion table, extract the row values to the respective variable.
      var Temperature = parseFloat(rows[i][0]);
      var Relat_Humid = parseFloat(rows[i][1]);
      var Time = parseFloat(rows[i][6]);

      //By default the first column will be always the x value.
      //That's why "Time" needs to be inserted first
      coordinates.push(Time);
      coordinates.push(Temperature);
      coordinates.push(Relat_Humid);

      //As default in Google LineChart structure:
      //If there're 3 columns, for ex., "time", "temp" and "moisture"
      //PointsToPlot will be an array containing float arrays of size == 3. being respectively to the columns.
      //Consequently, 2 columns, for ex., "time", "temp".
      //PointsToPlot will be an array containing float arrays of size == 2. ex: [[1,15],[2,13],...]
      PointsToPlot.push(coordinates);

    }
    //call the drawChart Function
    drawChart(PointsToPlot);
  }

  function drawChart(PointsToPlot) {
    //Create a Google object to plot the data for the chart
    var data = new google.visualization.DataTable();

    //Create a empty array to be inserted the fields to be removed based on the checkboxes that are unchecked
    var position_to_remove = [];

    //Array containing the hex colors for plotting the lines.
    //Color for 5 different y-axis variables.
    //If number of y-axis variables to be plotted is greater than 5,
    //more colors needs to be added to the following array.
    var color_palette_hex = ['#DB3340', '#E8B71A', '#1FDA9A', '#28ABE3', '#8C4646'];

    //Add the columns names for the chart
    //The first is always the x-axis, in this specific case, it's the "time". And the rest are for the y-axis.
    data.addColumn('number', "Time");

    //Variable the total number of y-axis variables
    var number_of_variables = 0;

    //Access and manages the checkbox class
    $('.cb_chart_var:checkbox').each(function() {

      if ($(this).prop("checked")) {
        //Add the further columns (y axis) based on the attribute name of the checkboxes checked.
        data.addColumn('number', $(this).attr("name"));
      } else {
        //Get the value from the checkbox that represents the position on the PointsToPlot array
        position_to_remove.push(parseInt($(this).prop("value")));
      }
      number_of_variables++;
    });

    color_palette_hex.splice(number_of_variables);

    position_to_remove.reverse();
    if (position_to_remove.length > 0) {
      for (var i in PointsToPlot) {
        for (var j in position_to_remove) {
          PointsToPlot[i].splice(position_to_remove[j], 1);
        }
      }

      for (var j in position_to_remove) {
        color_palette_hex.splice(position_to_remove[j] - 1, 1);
      }
    }

    //Add the coordinates for plotting the chart.
    //Array of arrays, where the first element of the child array is the x-axis and the rest for the y-axis
    data.addRows(PointsToPlot)

    //Create the option for the LineChart
    //See documentation in: https://developers.google.com/chart/interactive/docs/gallery/linechart
    var options = {
      //Give a title to the chart
      title: 'Data retrieved from Sensebox',

      width:900,
      height:500,

      //Control the position of the legend
      legend: {
        position: 'bottom'
      },

      //It's supposed to add smoothness to the line plot,
      //But it doesn't seems that is changing anything.
      curveType: 'function',

      //Properties for the horizontal axis
      hAxis: {
        title: 'Time',
        logScale: false
      },

      //Properties for the vertical axis
      //vAxis: {}

      //Option that allows users to pan and zoom Google charts.
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        //Just zoom the horizontal axis
        axis: 'horizontal',
        //To ensure that users don't pan where there's no data.
        keepInBounds: true
      },

      //Add the colors to the lines
      colors: color_palette_hex
    };

    //Create the LineChart object
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    //Plot the coordinates on it.
    chart.draw(data, options);
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
