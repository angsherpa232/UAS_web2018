var uas2018 = angular.module('uas2018', []);

uas2018.controller('uas2018_controller', ['$scope', '$location', '$rootScope', function($scope, $location, $rootScope) {
  if ($location.path() == '/login') {
    $scope.x = false;
  } else {
    $scope.x = true;
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


.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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
    templateUrl: './home/views/map_3d.html'
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


.controller('uas2018_map_controller', ['$scope', '$http', function($scope, $http) {

  //load google packages for the chart
  google.charts.load('current', {packages: ['corechart', 'line', 'timeline', 'gauge']});

  // Load basemaps
  var topo = L.esri.basemapLayer("Topographic");
  var darkgrey = L.esri.basemapLayer("DarkGray");
  var imagery = L.esri.basemapLayer("Imagery");

  // Main map object
  var map = L.map('map', {
    center: [51.944990, 7.572810],
    zoom: 17,
    layers: [imagery],
    maxZoom: 19,
    maxNativeZoom: 19
  });

  var mapHome = {
    lat: 51.944990,
    lng: 7.572810,
    zoom: 17
  };

  L.easyButton('<span><img src="./home/resources/icons/meeting-point-32.png" width=15 height=15></img></span>',function(btn,map){
    map.setView([mapHome.lat, mapHome.lng], mapHome.zoom);
  },'Zoom To Home', {position: 'bottomleft'}).addTo(map);

  // /*Zoom button*/
  // var legendCenterButton = L.control({position: 'bottomright'})
  //
  // legendCenterButton.onAdd = function () {
  //     var div = L.DomUtil.create('center', 'center-button');
  //
  //     var zooming = '<span ng-click="zoomRiver()">';
  //     zooming += '<img style="width: 24px; height: 24px;" src="app/components/assets/button_icons/meeting-point-32.png"/>';
  //     zooming += '</span>';
  //     div.innerHTML = zooming;
  //
  //     var linkFunction = $compile(angular.element(div));
  //     var newScope = $scope.$new();
  //
  //     return linkFunction(newScope)[0];
  // };
  // legendCenterButton.addTo(map); //Added by default
  // /*End Zoom button*/

  // Default base layers when the app initiates
  var baseLayers = {
    "Imagery": imagery,
    "Topographic": topo,
    "Gray": darkgrey
  };

  var sidebar = L.control.sidebar('sidebar', {
    position: 'right'
    // height: 750;
    // width: 780;
  });

  map.addControl(sidebar);

  ///////////////////////Map Layers/////////////////////////

  //////SenseBox ground sensors///////

  // Load ground sensor coordinate data, create markers and add as map layer
  var marker_id;
  var station_value;

  var dataURL = "./home/resources/markers_project.geojson"

  var jsonData = $.ajax({
    url: dataURL,
    async: false,
    success: function(res) {
      return res
    }
  }).responseJSON


    // Load ground sensor coordinate data, create markers and add as map layer
    var marker_id;

    var dataURL = "./home/resources/markers_project.geojson"


      switch ( feature.properties.Station ) {
        case "A":
        case "B":
        case "C":
        case "D":
        //Water parameters points:
        marker_color = "marker-icon-blue";
        break;
        case "E":
        case "F":
        //Air Quality points:
        marker_color = "marker-icon-red";
        break;
        case "G":
        //Water Level point:
        marker_color = "marker-icon-blue";
        break;
        case "H":
        case "I":
        //Weather stations points:
        marker_color = "marker-icon-orange";
        break;
        default:
        marker_color = "marker-icon-grey";
      }

      var marker = L.marker(latlng, {
        icon: L.icon({
          iconUrl: "./home/resources/icons/"+marker_color+".png",
          iconSize: [25, 41]
        })
      } );
      marker.bindPopup("Station ID: " + feature.properties.id + '<br/>' + "Station name: " + feature.properties.Station + '<br/>' + "Station type: " + feature.properties.Type);
      marker.on('mouseover', function (e) {
        this.openPopup();
      });
      marker.on('mouseout', function (e) {
        this.closePopup();
      });

      return marker;
    },
    onEachFeature: function(feature, layer) {
      layer.on('click', function(e) {


        //global variable receives the id of the marker clicked by the user
        station_value = feature.properties.Station;

        //Run the function that request the data based on the marker clicked by the user
        process_marker_click(station_value);

        //console.log(feature);
        sidebar.show();



          //ensure that all times a marked is clicked,
          //all the checkbox from the class ".cb_chart_var" initiate as checked
          $(".cb_chart_var").prop("checked", true)


        if (sidebar_opened == 0) {
          sidebar_opened = 1;
        }

      }); //end Event listener 'click' for the marker
    } //end onEachFeature
    //EDIT_matheus
  }).addTo(map);


    //creates a cluster object
    var sensorLayer = L.markerClusterGroup();

    //Add the variable that contains all the markers to the cluster object
    sensorLayer.addLayer(markers);


  //event listener for hiding the sidebar_popup when the user clicks in the map
  map.on('click', function(e) {
    sidebar.hide();
  });

  //Jquery function that map changes in the "#CheckboxDIV",
  //when a checkbox from the class ".cb_chart_var" is clicked
  $("#CheckboxDIV").on("change", ".cb_chart_var", function() {
    //for each click(change) in the checkbox a new requestion to the fusion table is made.
    process_marker_click(station_value);
  });


  $("#RadioDIV").on("change", ".radiobut", function() {
    //for each click(change) in the checkbox a new requestion to the fusion table is made.
    AirQuality_Chart();
  });


   
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
      data.addRows(PointsToPlot)
      console.log("+++PointsToPlot:");
      console.log(PointsToPlot);

      var options = {
        title: 'Data retrieved from Sensebox',
        width: 750,
        height: 500,
        legend: {
          position: 'bottom',
          maxLines: 2
        },
        backgroundColor: {
          stroke: '#4322c0',
          strokeWidth: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
        chartArea:{
          left:45,
          right: 10,
          top:35,
          bottom:75,
          width:"80%",
          height:"80%"
        },
        hAxis: {
          //title: 'Time',
          // direction: -1,
          // slantedText:true,
          // slantedTextAngle:45,
          gridlines: {
            units: {
              days: {format: ['MMM dd']},
              hours: {format: ['HH:mm', 'ha']},
            },
          },
          minorGridlines: {
            units: {
              hours: {format: ['hh:mm a', 'ha']}
            }
          }
        },
        curveType: 'function',
        vAxis: {
          viewWindow: {
            min: 0,
          },
          //logScale: true
        },
        explorer: {
          actions: ['dragToZoom', 'rightClickToReset'],
          axis: 'horizontal',
          //keepInBounds: true
        },
        //enableInteractivity: false,
        colors: color_palette_hex


      };

      // var chart = new google.charts.Line(document.getElementById('chart_div'));
      // chart.draw(data, google.charts.Line.convertOptions(options));

      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(data, options);


    }


    ////// Flight plan layer //////

    $scope.flightPlanOnEachFeature = function(feature, layer) {
      var popupContent = "Altitude: " + feature.properties.Altitude;
      layer.bindPopup(popupContent);
    };

    // Sets color based on altitude
    $scope.getColor = function(x) {
      return x < 46 ? '#ffeda0' :
      x < 48.1 ? '#feb24c' :
      x < 50.8 ? '#f03b20' :
      '#f01010';
    };

    //Flight plan
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


    ////// DEM layer //////
    var DEMlayer = L.esri.tiledMapLayer({
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/DEM_2018/MapServer",
      zIndex: 200,
      maxZoom: 19
    })


    ////// Hillshade layer //////
    var hillshadelayer = L.esri.tiledMapLayer({
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Hillshade_2018/MapServer",
      // zIndex: 200,
      maxZoom: 19
      // maxNativeZoom:21
      //EDIT_matheus
      //}).addTo(map);
    });


    ////// NDVI layer //////

    var NDVIlayer = L.esri.tiledMapLayer({
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/NDVI/MapServer",
      zIndex: 200,
      maxZoom: 19,
      maxNativeZoom: 19
    })

    ////// Slope layer //////

    var slopelayer = L.esri.tiledMapLayer({
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Slope_2018/MapServer",
      zIndex: 200,
      maxZoom: 19,
      maxNativeZoom: 19
    })


    ////// Aspect  layer //////

    var aspectlayer = L.esri.tiledMapLayer({
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Aspect_2018/MapServer",
      zIndex: 200,
      maxZoom: 19,
      maxNativeZoom: 19
    })

    //Add here if additional overlays are to be added
    var overlays = {
      "Digital Elevation Model": DEMlayer,
      "Hillshade": hillshadelayer,
      "NDVI": NDVIlayer,
      "Slope": slopelayer,
      "Aspect": aspectlayer,
      "Flight plan": flightPlanLayer,
      "Ground Sensors": sensorLayer
    };

    //Initiate layers control method and add to map
    L.control.layers(baseLayers, overlays, {position: 'topleft'}).addTo(map);


    map.on('overlayadd', function(layer) {
      console.log(layer.name)
      console.log(layer)
      // map.fitBounds(layer.getBounds().pad(0.5))
      // map.setView(this.getBounds().getCenter());
      // console.log(this.getBounds())
      if(layer.name == "Ground Sensors"){
        map.fitBounds(sensorLayer.getBounds());
      } else {
        // } else if (layer.name == "Flight plan") {
        // map.fitBounds(flightPlanLayer.getBounds().pad(0.5));
        map.setView([51.944990, 7.572810], 17);
        // } else {
        //   map.fitBounds(layer.getBounds())
        // console.log("raster!")
      }
    });
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
