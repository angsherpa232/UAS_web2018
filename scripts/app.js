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
      packages: ['corechart', 'line', 'timeline', 'gauge' ]
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
      // $scope.createLegend($scope.layerNames[0])
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
      var station_value;

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


          }); //end Event listener 'click' for the marker
        } //end onEachFeature
        //EDIT_matheus
      })

      //creates a cluster object
      var sensorLayer = L.markerClusterGroup({
        name: "Ground Sensors"
      });

      //Add the variable that contains all the markers to the cluster object
      sensorLayer.addLayer(markers);

      //event listener for hiding the sidebar_popup when the user clicks in the map
      map.on('click', function(e) {
        sidebar.hide();
        document.getElementById("legendDiv").style.display = "none"
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

var Active_Station = ""
    function process_marker_click(marker_station){
      console.log("Station: "+marker_station);
      console.log("Active Station: "+Active_Station);
      switch ( marker_station ) {
          //Water parameters points  ||  Fusiontable name: Water_parameters_river  ||  Fusiontable ID: 1MgGVSpMf3w7HHq5t4sPCsJPc8Wat1nVioG-TAJO3
          case "A":
            WaterParameters_Chart("A");
            console.log('WaterParameters_Chart("A");');
            Active_Station = "A";
            break;
          case "B":
            WaterParameters_Chart("B");
            console.log('WaterParameters_Chart("B");');
            Active_Station = "B";
            break;
          case "C":
            WaterParameters_Chart("C");
            console.log('WaterParameters_Chart("C");');
            Active_Station = "C";
            break;
          case "D":
            WaterParameters_Chart("D");
            console.log('WaterParameters_Chart("D");');
            Active_Station = "D";
            break;

          //Air Quality points  ||  Fusiontable name: AQ_Processed  || Fusiontable ID: 1AkX22UU-fqR_gIyv_hBTYR55_7ksr1jjejr1N6ur
          case "E":
          case "F":
            console.log('AirQuality_Chart();');
            AirQuality_Chart();
            Active_Station = "E";
            break;

          //Water Level points  ||  Fusiontable name: Water_level_processed ||  Fusiontable ID: 1h2_7KqG_3hHQZDLJijqFqSvILuM26unc5Hnksnhn
          case "G": //OK
            console.log('WaterLevel_Chart()');
            WaterLevel_Chart();
            Active_Station = "G";
            break;

          //Weather stations points  ||  Fusiontable name: WEATHER1_Processed  || Fusiontable ID: 1CBn0rAtMSTFH2jNbF7wXx8bkkwjn1xLnBdMCXqV6
          case "H":
            console.log('WeatherStation_Chart(H)');
            WeatherStation_Chart("H");
            Active_Station = "H";
            break;

          //Weather stations points  ||  Fusiontable name: WEATHER2_Processed  ||  Fusiontable ID: 1KyssrYpcg9JT9ps0kRAfxGargS-KekSlr7PrWRmR
          case "I":
            console.log('WeatherStation_Chart(I)');
            WeatherStation_Chart("I");
            Active_Station = "I";
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

        var checkbox_div = document.getElementById("chart_div");



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
          gaugeData_Temp.addColumn('number', 'Water Temp(C)');
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
        document.getElementById("chart_div").innerHTML = "";

        if ( !sidebar.isVisible() || Active_Station != "E" ){
          var rb_html = '<input type="radio" class="radiobut" name="rb" value="pm25" checked> PM2.5<br>';
          rb_html = rb_html+ '<input type="radio" class="radiobut" name="rb" value="pm10"> PM10<br>'
          rb_html = rb_html+ '<input type="radio" class="radiobut" name="rb" value="rh"> Relative Humidity'
          document.getElementById("RadioDIV").innerHTML = rb_html;
        }



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

      function WeatherStation_Chart(Station_Letter){

        if (Station_Letter == "H"){
          fusiontable_id = "1CBn0rAtMSTFH2jNbF7wXx8bkkwjn1xLnBdMCXqV6";
        }else if (Station_Letter == "I"){
          fusiontable_id = "1KyssrYpcg9JT9ps0kRAfxGargS-KekSlr7PrWRmR";
        }else{
          alert("Fusion table not defined for Station: "+ Station_Letter )
        }

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
        document.getElementById("chart_div").innerHTML = "";



        if ( !sidebar.isVisible() || Active_Station != Station_Letter){
          document.getElementById("CheckboxDIV").innerHTML = "";

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

    var mapLayers = [orthophotoRGBlayer, orthophotoMSlayer, DSMlayer, hillshadelayer, NDVIlayer, slopelayer, aspectlayer, flightPlanLayer, flightPointLayer, landCoverUASLayer, landCoverCORINELayer, sensorLayer]
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

    var legendText = "Orthorectified image that displays the features of the study area using the channels of the visible range of the electromagnetic spectrum (Area of 3 Ha). Moreover, it is a product of a drone flight using a camera sony alpha 5100, flight height 40 meters"
    $scope.layerDescription = legendText


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
          document.getElementById("legendImage").src = "./home/resources/legend/DSM_withoutNamef.png";
          break;
        case "Hillshade":
          legendText="This layer is a shaded relief raster created by the DSM and the sun angle."
          document.getElementById("legendImage").src = "./home/resources/legend/hillshade_withoutNamef.png";
          break;
        case "NDVI":
          legendText = "NDVI is a standardized way to measure healthy vegetation. It is a product that compares values of red and near infrared. Dark green indicates high NDVI whereas red has low NDVI."
          document.getElementById("legendImage").src = "./home/resources/legend/NDVI_withoutnamef.png";
          break;
        case "Slope":
          legendText = "Derived from the DSM, this layer contains slope angle of project area to demonstrate topograpy."
          document.getElementById("legendImage").src = "./home/resources/legend/slope_withotNamef.png";
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
          legendText = "Orthorectified image that displays the features of the study area using the channels of the visible range of the electromagnetic spectrum (Area of 3 Ha). Moreover, it is a product of a drone flight using a camera sony alpha 5100, flight height 40 meters"
          document.getElementById("legendImage").src = "";

      }


    }

    // $scope.selectedLayer = "Orthophoto RGB"

    // $scope.dropdownDefault = function() {
    //   $scope.selectedLayer =
    //   createLegend
    // }

    // $scope.dropdownDefault = "Choose layer"

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
