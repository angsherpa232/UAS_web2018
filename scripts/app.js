var uas2018 = angular.module('uas2018', []);

uas2018.controller('uas2018_controller', ['$scope', '$location', '$rootScope', function($scope, $location, $rootScope) {
  if ($location.path() == '/login'){
    $scope.x = false;
  } else {
    $scope.x = true;
  }

}]);

// uas2018.controller('text_controller', ['$scope', '$location', '$rootScope', function($scope, $location, $rootScope) {
//   $('.pagelink').click(function() {
//     $('body').animate({
//       scrollTop: eval($('#' + $(this).attr('target')).offset().top - 70)
//     }, 1000);
//   });
// }]);




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

  // Boolean value for closed (0) and opened (1) chart sidebar
  var sidebar_opened = 0;

  var markers = L.geoJson(jsonData, {
    pointToLayer: function(feature, latlng) {

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

  function process_marker_click(marker_station){
    console.log("Station: "+marker_station);
    switch ( marker_station ) {
      //Water parameters points  ||  Fusiontable name: Water_parameters_river  ||  Fusiontable ID: 1MgGVSpMf3w7HHq5t4sPCsJPc8Wat1nVioG-TAJO3
      case "A":
      WaterParameters_Chart("A");
      console.log('WaterParameters_Chart("A");');
      break;
      case "B":
      WaterParameters_Chart("B");
      console.log('WaterParameters_Chart("B");');
      break;
      case "C":
      WaterParameters_Chart("C");
      console.log('WaterParameters_Chart("C");');
      break;
      case "D":
      WaterParameters_Chart("D");
      console.log('WaterParameters_Chart("D");');
      break;

      //Air Quality points  ||  Fusiontable name: AQ_Processed  || Fusiontable ID: 1AkX22UU-fqR_gIyv_hBTYR55_7ksr1jjejr1N6ur
      case "E":
      case "F":
      console.log('AirQuality_Chart();');
      AirQuality_Chart();
      break;

      //Water Level points  ||  Fusiontable name: Water_level_processed ||  Fusiontable ID: 1h2_7KqG_3hHQZDLJijqFqSvILuM26unc5Hnksnhn
      case "G": //OK
      console.log('WaterLevel_Chart()');
      WaterLevel_Chart();
      break;

      //Weather stations points  ||  Fusiontable name: WEATHER1_Processed  || Fusiontable ID: 1CBn0rAtMSTFH2jNbF7wXx8bkkwjn1xLnBdMCXqV6
      case "H":
      console.log('WeatherStation_Chart(H');
      WeatherStation_Chart("1CBn0rAtMSTFH2jNbF7wXx8bkkwjn1xLnBdMCXqV6");
      break;

      //Weather stations points  ||  Fusiontable name: WEATHER2_Processed  ||  Fusiontable ID: 1KyssrYpcg9JT9ps0kRAfxGargS-KekSlr7PrWRmR
      case "I": //OK
      console.log('WeatherStation_Chart(I');
      WeatherStation_Chart("1KyssrYpcg9JT9ps0kRAfxGargS-KekSlr7PrWRmR");
      break;
    }

  }

    function WaterParameters_Chart(Station_name){
    document.getElementById("CheckboxDIV").innerHTML = "";
    document.getElementById("RadioDIV").innerHTML = "";
    document.getElementById("chart_div").innerHTML = "";

    //===================- FUNCTION request_fusiontable_data ===================
    var url = ['https://www.googleapis.com/fusiontables/v2/query?'];
    url.push('sql=');
    var query = "SELECT * "
    query = query + " FROM 1MgGVSpMf3w7HHq5t4sPCsJPc8Wat1nVioG-TAJO3 ";
    query = query + " WHERE 'Station' LIKE '" + Station_name +"'";
    query = query + " ORDER BY 'Timestamp' ASC ";
    var encodedQuery = encodeURIComponent(query);
    url.push(encodedQuery);
    url.push('&key=AIzaSyCoC9A3WgFneccRufbysInygnWrhCie-T0');

    var queryData = $.ajax({
      url: url.join(''),
      async: false,
    }).responseText
    var queryJson = JSON.parse(queryData)

    console.log( "++++Data from Fusiontable:" )
    console.log( queryJson )

    var rows = queryJson['rows'];

    var checkbox_div = document.getElementById("CheckboxDIV");

    for(var i=0;i<rows.length;i++){

      var newInput = document.createElement("span");
      newInput.setAttribute("id", "span_"+rows[i][0]);
      checkbox_div.appendChild(newInput);

      var date_replace = new Date( rows[i][4].replace(" ", "T") )
      document.getElementById("span_"+rows[i][0]).innerHTML = date_replace+"</br>";

      var newInput = document.createElement("div");
      newInput.setAttribute("id", "div_"+rows[i][0]);
      checkbox_div.appendChild(newInput);

      var gaugeOptions_Temp = {min: 0, max: 40,
        yellowFrom: 20, yellowTo: 25,redFrom: 25, redTo: 40,
        minorTicks: 10, majorTicks:5, width: 250, height: 250};



        gaugeData_Temp = new google.visualization.DataTable();
        gaugeData_Temp.addColumn('number', 'Water Temp ºC');
        gaugeData_Temp.addColumn('number', 'Ph');
        gaugeData_Temp.addRows(2);
        gaugeData_Temp.setCell(0, 0, rows[i][5]);
        gaugeData_Temp.setCell(0, 1, rows[i][6]);

        var gauge_Temp = new google.visualization.Gauge(document.getElementById("div_"+rows[i][0]));
        gauge_Temp.draw(gaugeData_Temp, gaugeOptions_Temp);
      }
    }

    function WaterLevel_Chart(){

      document.getElementById("CheckboxDIV").innerHTML = "";
      document.getElementById("RadioDIV").innerHTML = "";
      document.getElementById("chart_div").innerHTML = "";


      var text_html = '<iframe width="750" height="500" scrolling="no" frameborder="no" src="https://fusiontables.google.com/embedviz?containerId=googft-gviz-canvas&amp;viz=GVIZ&amp;t=LINE_AGGREGATE&amp;isXyPlot=true&amp;bsize=0.0&amp;q=select+col1%2C+col2+from+1h2_7KqG_3hHQZDLJijqFqSvILuM26unc5Hnksnhn&amp;qrs=+where+col1+%3E%3D+&amp;qre=+and+col1+%3C%3D+&amp;qe=+order+by+col1+asc&amp;uiversion=2&amp;gco_forceIFrame=true&amp;gco_hasLabelsColumn=true&amp;width=750&amp;height=500"></iframe>';
      document.getElementById("chart_div").innerHTML = text_html;
    }

    function AirQuality_Chart(){
      document.getElementById("CheckboxDIV").innerHTML = "";
      document.getElementById("RadioDIV").innerHTML = "";
      document.getElementById("chart_div").innerHTML = "";

      var rb_html = '<input type="radio" class="radiobut" name="rb" value="pm25" checked> PM2.5<br>';
      rb_html = rb_html+ '<input type="radio" class="radiobut" name="rb" value="pm10"> PM10<br>'
      rb_html = rb_html+ '<input type="radio" class="radiobut" name="rb" value="rh"> Relative Humidity'
      document.getElementById("RadioDIV").innerHTML = rb_html;


      var radio_checked_value = $("input[type='radio'][class='radiobut']:checked").val();
      switch ( radio_checked_value ) {
        case "pm25":
        document.getElementById("chart_div").innerHTML = '<iframe width="750" height="500" frameborder="0" scrolling="no" src="//plot.ly/~lore_abad6/4.embed"></iframe>';
        break;
        case "pm10":
        document.getElementById("chart_div").innerHTML = '<iframe width="750" height="500" frameborder="0" scrolling="no" src="//plot.ly/~lore_abad6/1.embed"></iframe>';
        break;
        case "rh":
        document.getElementById("chart_div").innerHTML = '<iframe width="750" height="500" frameborder="0" scrolling="no" src="//plot.ly/~lore_abad6/6.embed"></iframe>';
        break;
      }
    }

    function WeatherStation_Chart(fusiontable_id){

      var url = ['https://www.googleapis.com/fusiontables/v2/query?'];
      url.push('sql=');
      var query = "SELECT * "
      query = query + " FROM "+ fusiontable_id +" ";
      query = query + " ORDER BY 'Timestamp' ASC ";
      var encodedQuery = encodeURIComponent(query);
      url.push(encodedQuery);
      url.push('&key=AIzaSyCoC9A3WgFneccRufbysInygnWrhCie-T0');

      var queryData = $.ajax({
        url: url.join(''),
        async: false,
      }).responseText
      var queryJson = JSON.parse(queryData)

      //=================== FUNCTION process_fusiontable_data ===================
      console.log( "++++ Data from Fusiontable:" )
      console.log( queryJson )

      var columns = queryJson['columns'];
      var rows = queryJson['rows'];

      document.getElementById("RadioDIV").innerHTML = "";
      document.getElementById("CheckboxDIV").innerHTML = "";
      document.getElementById("chart_div").innerHTML = "";
      var checkbox_div = document.getElementById("CheckboxDIV");
      for(var i=0;i<columns.length;i++){
        if(i===0){
          continue;
        }else{
          //var cb_name = columns[i].split("(")[0];
          var cb_name = columns[i];
          var cb_id = "cb_id_"+ i.toString() ;
          var cb_value = i;
          //<input type="checkbox" class="cb_chart_var" id="cb_temp" name="Temperature" value="1" checked>
          var newInput = document.createElement("input");
          newInput.setAttribute("type",'checkbox');
          newInput.setAttribute("id", cb_id);
          newInput.setAttribute("class",'cb_chart_var');
          newInput.setAttribute("name", cb_name);
          newInput.setAttribute("value", cb_value );
          checkbox_div.appendChild(newInput);

          document.getElementById(cb_id).checked = true;

          //<label for="cb_temp">Temperature</label>
          var newlabel = document.createElement("label");
          newlabel.setAttribute("for",cb_id);
          newlabel.innerHTML = cb_name;
          checkbox_div.appendChild(newlabel);

        }
      }
      //=================== FUNCTION drawChart ===================
      var data = new google.visualization.DataTable();

      var PointsToPlot = [];
      for(var i=0;i<rows.length;i++){
        //"6/9/2018 19:30"
        var eachrow = [];
        //console.log("i: ", i);
        for(var j=0;j<rows[i].length;j++){
          //console.log("j: ", j);
          //if (j === 4) { break; }
          if (j == 0){
            var split_date_value = rows[i][0].split(" ");
            var date_split = split_date_value[0].split("/");
            var time_split = split_date_value[1].split(":");

            var date_replace = new Date(parseInt(date_split[2]),  parseInt(date_split[0])-1, parseInt(date_split[1]), parseInt(time_split[0]), parseInt(time_split[1]))
            eachrow.push(date_replace);
          }else{
            eachrow.push(parseFloat(rows[i][j]));
          }
        }
        PointsToPlot.push(eachrow);
      }
      console.log("1+++PointsToPlot:");
      console.log(PointsToPlot);

      var position_to_remove = [];
      var color_palette_hex = ['#DB3340', '#E8B71A', '#1FDA9A', '#28ABE3', '#8C4646', '#8cb709'];
      var number_of_variables = 0;

      data.addColumn('date', columns[0]);

      $('.cb_chart_var:checkbox').each(function() {
        if ($(this).prop("checked")) {
          data.addColumn('number', $(this).attr("name"));
        } else {
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
