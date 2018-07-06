var uas2018 = angular.module('uas2018', []);

uas2018.controller('uas2018_controller', ['$scope', '$location', '$rootScope', function($scope, $location, $rootScope) {
  if ($location.path() == '/login') {
    $scope.x = false;
  } else {
    $scope.x = true;
  }

}]);

// uas2018.controller('legend_controller', ['$scope', function($scope){
//
// }])


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
        controller: 'uas2018_process_controller',
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

  .controller('uas2018_map_controller', ['$scope', '$http', '$compile', function($scope, $http, $compile) {

    //load google packages for the charts
    google.charts.load('current', {
      packages: ['corechart', 'line']
    });

    L.Control.Layers.include({
      getActiveOverlays: function() {

        // Create array for holding active layers
        var active = [];
        var context = this;
        // Iterate all layers in control
        context._layers.forEach(function(obj) {

          // Check if it's an overlay and added to the map
          if (obj.overlay && context._map.hasLayer(obj.layer)) {

            // Push layer to active array
            active.push(obj);
          }
        });

        // Return array
        return active;
      }
    });

    // Load basemaps
    // var topo = L.esri.basemapLayer("Topographic");
    // var darkgrey = L.esri.basemapLayer("DarkGray");
    // var imagery = L.esri.basemapLayer("Imagery");

    var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>'

    var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibmdhdmlzaCIsImEiOiJjaXFheHJmc2YwMDdoaHNrcWM4Yjhsa2twIn0.8i1Xxwd1XifUU98dGE9nsQ';

    var grayscale = L.tileLayer(mbUrl, {
      id: 'mapbox.light',
      attribution: mbAttr,
      maxZoom: 22,
      maxNativeZoom: 18
    })
    var streets = L.tileLayer(mbUrl, {
      id: 'mapbox.streets',
      attribution: mbAttr,
      maxZoom: 22,
      maxNativeZoom: 18
    })
    var outdoors = L.tileLayer(mbUrl, {
      id: 'mapbox.outdoors',
      attribution: mbAttr,
      maxZoom: 22,
      maxNativeZoom: 18
    })
    var satellite = L.tileLayer(mbUrl, {
      id: 'mapbox.satellite',
      attribution: mbAttr,
      maxZoom: 22,
      maxNativeZoom: 18
    })
    var dark = L.tileLayer(mbUrl, {
      id: 'mapbox.dark',
      attribution: mbAttr,
      maxZoom: 22,
      maxNativeZoom: 18
    })

    var satellitestreets = L.tileLayer(mbUrl, {
      id: 'mapbox.streets-satellite',
      attribution: mbAttr,
      maxZoom: 22,
      maxNativeZoom: 18
    });

    // Main map object
    var map = L.map('map', {
      center: [51.944990, 7.572810],
      zoom: 17,
      layers: [satellite],
      maxZoom: 22,
      maxNativeZoom: 18
    });

    // Map default extent
    var mapHome = {
      lat: 51.944990,
      lng: 7.572810,
      zoom: 17
    };

    // Center on AOI button
    L.easyButton('<span><img src="./home/resources/icons/meeting-point-32.png" style="width: 15px; height: 15px;"></img></span>', function(btn, map) {
      map.setView([mapHome.lat, mapHome.lng], mapHome.zoom);
    }, 'Zoom To Home', {
      position: 'bottomright'
    }).addTo(map);

    // Display legend button
    var legendBt = L.easyButton('<p style="font-size:15px;">Info</p>', function() {
      var x = document.getElementById("legendDiv");
      if (x.style.display === "none") {
        x.style.display = "inline-block";
      } else {
        x.style.display = "none";
      }
    }, 'Show Legend', {
      position: 'topleft'
    }).addTo(map);

    legendBt.button.style.width = '40px';
    // legendBt.button.style.height = '50px';

    // Default base layers when the app initiates
    var baseLayers = {
      "Imagery": satellite,
      "Streets": streets,
      "Gray": dark
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

    var dataURL = "./home/resources/markers_project.geojson"

    var jsonData = $.ajax({
      url: dataURL,
      async: false,
      success: function(res) {
        return res
      }
    }).responseJSON

    // Boolean value for closed (0) and opened (1) chart sidebar
    var sidebar_opened = 0;

    var markers = L.geoJson(jsonData, {
      pointToLayer: function(feature, latlng) {

        switch (feature.properties.Station) {
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
            iconUrl: "./home/resources/icons/" + marker_color + ".png",
            iconSize: [25, 41]
          })
        });
        marker.bindPopup("Station ID: " + feature.properties.id + '<br/>' + "Station name: " + feature.properties.Station + '<br/>' + "Station type: " + feature.properties.Type);
        marker.on('mouseover', function(e) {
          this.openPopup();
        });
        marker.on('mouseout', function(e) {
          this.closePopup();
        });

        return marker;
      },
      onEachFeature: function(feature, layer) {
        layer.on('click', function(e) {
          console.log(feature);
          sidebar.show();

          //global variable receives the id of the marker clicked by the user
          marker_id = feature.properties.id;

          //trying to shift the marker to the left when the sidepopup opens
          //map.setView({lat:e.latlng.lat, lng:(e.latlng.lng + 0.002)}, 22)

          //Run the function that request the data based on the marker clicked by the user
          request_fusiontable_data(marker_id);

          //ensure that all times a marked is clicked,
          //all the checkbox from the class ".cb_chart_var" initiate as checked
          $(".cb_chart_var").prop("checked", true)

          if (sidebar_opened == 0) {
            sidebar_opened = 1;
            // $('#side_popup').show().css({
            //   left: ($('#side_popup').width())
            // }).animate({left: 0}, 600);
          }

          console.log("marker ID: " + marker_id)

        }); //end Event listener 'click' for the marker
      } //end onEachFeature
    })

    //creates a cluster object
    var sensorLayer = L.markerClusterGroup({
      name: "Ground Sensors"
    });

    //Add the variable that contains all the markers to the cluster object
    sensorLayer.addLayer(markers);

    // //Add the clusters to the map
    // map.addLayer(sensorLayer);
    //Centralize and zoom the map to fit all the markers in the screen, automatically.
    // map.fitBounds(markers.getBounds());

    //event listener for hiding the sidebar_popup when the user clicks in the map
    map.on('click', function(e) {
      sidebar.hide();
      document.getElementById("legendDiv").style.display = "none"
      // sidebar_opened = 0;
      // $('#side_popup').hide().css({
      //   right: ($('#side_popup').width())
      // }).animate({left: 0	}, 600);

    });

    //Jquery function that map changes in the "#CheckboxDIV",
    //when a checkbox from the class ".cb_chart_var" is clicked
    $("#CheckboxDIV").on("change", ".cb_chart_var", function() {
      //for each click(change) in the checkbox a new requestion to the fusion table is made.
      request_fusiontable_data(marker_id);
    });


    //// Linking SenseBox data to map markers and drawing charts ////

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

        width: 750,
        height: 500,

        //Control the position of the legend
        legend: {
          position: 'bottom'
        },

        backgroundColor: {
          stroke: '#4322c0',
          strokeWidth: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },

        chartArea: {
          left: 45,
          right: 10,
          top: 35,
          bottom: 75,
          width: "80%",
          height: "80%"
        },

        //It's supposed to add smoothness to the line plot
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

      //Set TimeOut to not overlap legend of chart when the sidebar is still opening
      if (sidebar_opened == 0) {
        setTimeout(function() {
          var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
          chart.draw(data, options);
        }, 700);
      }

      //Create the LineChart object
      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      //Plot the coordinates on it.
      chart.draw(data, options);
    }



    //////Orthophoto RGB//////
    var orthophotoRGBlayer = L.esri.tiledMapLayer({
      name: "Orthophoto RGB",
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Orthophoto_RGB/MapServer",
      zIndex: 200,
      maxZoom: 22,
      maxNativeZoom: 22
    }).addTo(map)

    // .addTo(map);

    //////Orthophoto RGB//////
    var orthophotoMSlayer = L.esri.tiledMapLayer({
      name: "Orthophoto Multispectral",
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Orthophoto_Multispectral/MapServer",
      zIndex: 200,
      maxZoom: 22,
      maxNativeZoom: 22
    })

    ////// DSM layer //////
    var DSMlayer = L.esri.tiledMapLayer({
      name: "Digital Surface Model",
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/DSM/MapServer",
      zIndex: 200,
      maxZoom: 22,
      maxNativeZoom: 22
    })


    ////// Hillshade layer //////
    var hillshadelayer = L.esri.tiledMapLayer({
      name: "Hillshade",
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Hillshade_2018/MapServer",
      zIndex: 200,
      maxZoom: 22,
      maxNativeZoom: 19
    })


    ////// NDVI layer //////
    var NDVIlayer = L.esri.tiledMapLayer({
      name: "NDVI",
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/NDVI/MapServer",
      zIndex: 200,
      maxZoom: 22,
      maxNativeZoom: 22
    })

    ////// Slope layer //////
    var slopelayer = L.esri.tiledMapLayer({
      name: "Slope",
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Slope_2018/MapServer",
      zIndex: 200,
      maxZoom: 22,
      maxNativeZoom: 19
    })


    ////// Aspect  layer //////
    var aspectlayer = L.esri.tiledMapLayer({
      name: "Aspect",
      url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Aspect_2018/MapServer",
      zIndex: 200,
      maxZoom: 22,
      // maxNativeZoom: 18
    })

    ////// Flight plan layers //////

    //// Flight plan popup ////  omitted because layer has only one feature (multiline) and no altitude attribute
    // $scope.flightPlanOnEachFeature = function(feature, layer) {
    //   var popupContent = "Altitude: " + feature.properties.Altitude;
    //   layer.bindPopup(popupContent);
    // };

    //Flight plan
    var flightPlanLayer = L.esri.featureLayer({
      name: "Flight plan",
      url: "https://services1.arcgis.com/W47q82gM5Y2xNen1/ArcGIS/rest/services/FlightPath/FeatureServer/0",
      style: {
        color: "#41b6c4"
      }
    });

    ////Flight Point////
    $scope.getColor = function(x) {
      return x < 94 ? '#ffffb2' :
        x < 95 ? '#fecc5c' :
        x < 95.5 ? '#fd8d3c' :
        x < 96 ? '#f03b20' :
        x > 96 ? '#bd0026' :
        '#f01010';
    };

    $scope.coordsOnEachFeature = function(feature, layer) {
      var popupContent = "Latitude: " + feature.properties.Latitude + "<br>" + "Longitude: " + feature.properties.Longitude + "<br>" + "Altitude: " + feature.properties.Altitude + " masl";
      layer.bindPopup(popupContent);
    };

    var flightPointLayer = L.esri.featureLayer({
      name: "Flight points",
      url: "https://services1.arcgis.com/W47q82gM5Y2xNen1/ArcGIS/rest/services/FlightPoints/FeatureServer/0",
      // style: function(feature){
      //   console.log(feature)
      // },
      pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
          radius: 1.5,
          fillOpacity: 0.85,
          color: $scope.getColor(feature.properties.Altitude)
        });
      },
      onEachFeature: $scope.coordsOnEachFeature
    });

    /////// Land Classification //////

    //// Land cover UAS

    // Create Popup for polygons
    $scope.classUasOnEachFeature = function(feature, layer) {
      var popupContent = "Class: " + feature.properties.class;
      layer.bindPopup(popupContent);
    };

    // Define colours for classes
    $scope.getClassificationColorUAS = function(className) {
      var color = "#FFFFFF";
      if (className === "Water") {
        color = "#6699ff";
      }
      if (className === "Vegetation over water") {
        color = "#1cccbf";
      }
      if (className === "Trees") {
        color = "#006600";
      }
      if (className === "Bushes") {
        color = "#00cd01";
      }
      if (className === "freshly cut grass") {
        color = "#fad395";
      }
      if (className === "Grasslands") {
        color = "#bedf82";
      }
      if (className === "Bare soil") {
        color = "#a06d07";
      }
      if (className === "Asphalt") {
        color = "#bb1214";
      }

      return color;
    }

    // Function to create style object for input feature
    // function style(feature) {
    //   return {
    //     fillColor: $scope.getClassificationColorUAS(feature.properties.class),
    //     weight: 0.5,
    //     opacity: 1,
    //     color: 'black',
    //     dashArray: '0.1',
    //     fillOpacity: 0.8
    //   };
    // }

    // Compile land cover UAS layer
    var landCoverUASLayer = L.esri.featureLayer({
      name: "Land Cover UAS",
      url: "https://services1.arcgis.com/W47q82gM5Y2xNen1/ArcGIS/rest/services/LandCover/FeatureServer/0",
      style: function(feature) {
        return {
          fillColor: $scope.getClassificationColorUAS(feature.properties.class),
          weight: 0.5,
          opacity: 1,
          color: 'black',
          dashArray: '0.1',
          fillOpacity: 0.8
        };
      },
      onEachFeature: $scope.classUasOnEachFeature
    });

    // Land cover CORINE

    // Create Popup for polygons
    $scope.classCorineOnEachFeature = function(feature, layer) {
      var popupContent = "Corine L1: " + feature.properties.CorineL1 + "<br>" + "Corine L2: " + feature.properties.CorineL2 + "<br>" + "Corine L3: " + feature.properties.CorineL3;
      layer.bindPopup(popupContent);
    };

    // Define colours for classes
    $scope.getClassificationColorCORINE = function(className) {
      var color = "#FFFFFF";
      if (className === "Water bodies") {
        color = "#6699ff";
      }
      if (className === "Agricultural areas") {
        color = "#e1cd01";
      }
      if (className === "Artificial surfaces") {
        color = "#bb1214";
      }

      return color;
    }

    var landCoverCORINELayer = L.esri.featureLayer({
      name: "Land Cover CORINE",
      url: "https://services1.arcgis.com/W47q82gM5Y2xNen1/ArcGIS/rest/services/LandCover_CORINE/FeatureServer/0",
      style: function(feature) {
        return {
          fillColor: $scope.getClassificationColorCORINE(feature.properties.CorineL1),
          weight: 0.5,
          opacity: 0.2,
          color: 'black',
          dashArray: '0.1',
          fillOpacity: 0.8
        };
      },
      // style: style,
      onEachFeature: $scope.classCorineOnEachFeature
    })
    // })

    // $scope.getInfoBox = function() {
    //     alert("inputLayer");
    // }

    //Add here if additional overlays are to be added
    var overlays = {
      "Orthophoto RGB": orthophotoRGBlayer,
      "Orthophoto Multispectral": orthophotoMSlayer,
      "Digital Surface Model": DSMlayer,
      "Hillshade": hillshadelayer,
      "NDVI": NDVIlayer,
      "Slope": slopelayer,
      "Aspect": aspectlayer,
      "Flight plan": flightPlanLayer,
      "Flight points": flightPointLayer,
      "Land Cover UAS": landCoverUASLayer,
      "Land Cover CORINE": landCoverCORINELayer,
      "Ground Sensors": sensorLayer
    };

    var mapLayers = [orthophotoMSlayer, orthophotoRGBlayer, DSMlayer, hillshadelayer, NDVIlayer, slopelayer, aspectlayer, flightPlanLayer, flightPointLayer, landCoverUASLayer, landCoverCORINELayer, sensorLayer]
    var layerNames = [];

    //Initiate layers control method and add to map
    $scope.ctrl = L.control.layers(baseLayers, overlays, {
      position: 'topright',
      autoZIndex: true
    }).addTo(map);

    // Legend Control
    for (i = 0; i < mapLayers.length; i++) {
      layerNames.push(mapLayers[i].options.name)
    }

    $scope.layerNames = layerNames

    console.log($scope.layerNames)

    var legendText
    var legendImage

    $scope.createLegend = function(layer) {

      switch (layer) {
        case "Orthophoto RGB":
          legendText = "Orthorectified image that displays the features of the study area using the channels of the visible range of the electromagnetic spectrum (Area of 3 Ha). Moreover, it is a product of a drone flight using a camera sony alpha 5100, flight height 40 meters"
          document.getElementById("legendImage").src = "";
          break;
        case "Orthophoto Multispectral":
          legendText = "Orthorectified multiespectral image that displays the features of the study area using the channels Red, Green and Near infrared of the electromagnetic spectrum (Area of 3 Ha). Moreover, it is a product of a drone flight using the multiespectral camera Mapir, flight height 60 meters."
          document.getElementById("legendImage").src = "";
          break;
        case "Digital Surface Model":
          legendText = "Photogrammetric product of a drone flight using the multiespectral camera Mapir. Flight height 60 meters."
          document.getElementById("legendImage").src = "./home/resources/legend/DSM_withoutName.png";
          break;
        case "Hillshade":
          legendText="This layer is a shaded relief raster created by the DSM and the sun angle."
          document.getElementById("legendImage").src = "./home/resources/legend/hillshade_withoutName.png";
          break;
        case "NDVI":
          legendText = "NDVI is a standardized way to measure healthy vegetation. It is a product that compares values of red and near infrared. Dark green indicates high NDVI whereas red has low NDVI."
          document.getElementById("legendImage").src = "./home/resources/legend/NDVI_withoutname.png";
          break;
        case "Slope":
          legendText = "Derived from the DSM, this layer contains slope angle of project area to demonstrate topograpy."
          document.getElementById("legendImage").src = "./home/resources/legend/slope_withotName.png";
          break;
        case "Aspect":
          legendText = "This layer displays the direction the slopes face to illustrate the surface terrain in the study area."
          document.getElementById("legendImage").src = "./home/resources/legend/aspectf.jpg";
          break;
        case "Flight plan":
          legendText = "This layer shows the path followed by the drone during th data acquisition. The altitude was maintained approximately at 40m above ground."
          document.getElementById("legendImage").src = "";
          break;
        case "Flight points":
          legendText = "The points in this layer show the coordinates where the drone stopped to create immagery. The point symbology is adjusted according to the altitude."
          document.getElementById("legendImage").src = "./home/resources/legend/flightPointsf.jpg";
          break;
        case "Land Cover UAS":
          legendText = "After processing the imagery a classification algorithm was applied and pixels classified into various classes."
          document.getElementById("legendImage").src = "./home/resources/legend/landCoverUASfff.jpg";
          break;
        case "Land Cover CORINE":
          legendText = "In this layer the polygons were classified using CORINE land cover (CLC) classes and nomenclature."
          document.getElementById("legendImage").src = "./home/resources/legend/landCoverCORINE.jpg";
          break;
        case "Ground Sensors":
          legendText = "The points on the map represent locations where data was acquired using a senseBox. The data acquired include water parameters, water level and meteorological parameters"
          document.getElementById("legendImage").src = "./home/resources/legend/gSensors.jpeg";
          break;
        default:

      }


    }

    $scope.onChange = function() {
      console.log($scope.selectedLayer)
       $scope.createLegend($scope.selectedLayer)
       $scope.layerDescription = legendText
    }


    var overlays

    // set view for layers
    map.on('overlayadd', function(layer) {
      overlays = $scope.ctrl.getActiveOverlays()
      console.log(layer)
      if (layer.name == "Ground Sensors") {
        map.fitBounds(sensorLayer.getBounds());
        // } else {
        //   map.setView([51.944990, 7.572810], 17);
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
