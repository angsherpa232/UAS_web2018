angular.module('UAS_2018')

.controller('uas2018_trial', ['$scope', '$rootScope','$timeout','$compile',function($scope,$rootScope,$timeout,$compile) {
        var imageLayer;
        var executed = false;
        $scope.ctrl = new L.LayerGroup();
        var map;
        $scope.my = {slidershow: false};
        $rootScope.sliderheight = 0;
        $scope.numberPoints = 0;

        var orangeIcon = L.icon({
            iconUrl: 'app/components/assets/floating/orange.png',
            iconSize: [36, 48], // size of the icon
            iconAnchor: [0, 72], // point of the icon which will correspond to marker's location
            popupAnchor: [18, -62] // point from which the popup should open relative to the iconAnchor
        });
        var tealIcon = L.icon({
            iconUrl: 'app/components/assets/floating/teal.png',
            iconSize: [36, 48], // size of the icon
            iconAnchor: [0, 72], // point of the icon which will correspond to marker's location
            popupAnchor: [18, -62] // point from which the popup should open relative to the iconAnchor
        });
        var purpleIcon = L.icon({
            iconUrl: 'app/components/assets/floating/purple.png',
            iconSize: [36, 48], // size of the icon
            iconAnchor: [0, 72], // point of the icon which will correspond to marker's location
            popupAnchor: [18, -62] // point from which the popup should open relative to the iconAnchor
        });

        $scope.replaceAll = function (str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        };

        $scope.createMap = function () {

            L.Control.Layers.include({
                getActiveOverlays: function () {

                    // Create array for holding active layers
                    var active = [];
                    var context = this;
                    // Iterate all layers in control
                    context._layers.forEach(function (obj) {

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

            var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibmdhdmlzaCIsImEiOiJjaXFheHJmc2YwMDdoaHNrcWM4Yjhsa2twIn0.8i1Xxwd1XifUU98dGE9nsQ';

            var grayscale = L.tileLayer(mbUrl, {
                    id: 'mapbox.light',
                    attribution: mbAttr,
                    maxZoom: 22,
                    maxNativeZoom: 18
                }),
                streets = L.tileLayer(mbUrl, {
                    id: 'mapbox.streets',
                    attribution: mbAttr,
                    maxZoom: 22,
                    maxNativeZoom: 18
                }),
                outdoors = L.tileLayer(mbUrl, {
                    id: 'mapbox.outdoors',
                    attribution: mbAttr,
                    maxZoom: 22,
                    maxNativeZoom: 18
                }),
                satellite = L.tileLayer(mbUrl, {
                    id: 'mapbox.satellite',
                    attribution: mbAttr,
                    maxZoom: 22,
                    maxNativeZoom: 18
                }),
                dark = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: mbAttr, maxZoom: 22, maxNativeZoom: 18}),
                light = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr, maxZoom: 22, maxNativeZoom: 18}),
                satellitestreets = L.tileLayer(mbUrl, {
                    id: 'mapbox.streets-satellite',
                    attribution: mbAttr,
                    maxZoom: 22,
                    maxNativeZoom: 18
                });


            map = L.map('mapid', {
                center: [51.944990, 7.572810], /*Default location */
                zoom: 17, /*Default Zoom, Higher = Closer) */
                layers: [satellitestreets], // Default basemaplayer on startrup, can also give another layer here to show by default)
                maxZoom: 22,
                maxNativeZoom: 18
            });

            var baseLayers = {
                "Grayscale": grayscale,
                //"Streets": streets,
                //"Outdoors": outdoors,
                //"Satellite": satellite,
                "Satellite Streets": satellitestreets,
                "Dark Map": dark
                //"Light Map": light
            };

            var MosaicLayer = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Orthophoto_WTL1/MapServer",
                zIndex: 200,
                maxZoom: 22,
                maxNativeZoom: 18
            }).addTo(map);

            var DSM = L.esri.tiledMapLayer({
                url: "http://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/River_Aa_DSM/MapServer",
                zIndex: 200,
                maxZoom: 22,
                maxNativeZoom: 18
            });

            var NDVILayer = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/NDVI_milti_subset1_tif/MapServer",
                zIndex: 200,
                maxZoom: 22,
                maxNativeZoom: 18
            });

            var falseColorLayer = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Multispectal/MapServer",
                zIndex: 200,
                maxZoom: 22,
                maxNativeZoom: 18
            });

            $scope.flightPlanOnEachFeature = function (feature, layer) {
                // console.log(feature.properties.Altitude)
                var popupContent = "Altitude: " + feature.properties.Altitude;
                layer.bindPopup(popupContent);
            }

            $scope.getColor = function (x) {
                return x < 46 ? '#ffeda0' :
                    x < 48.1 ? '#feb24c' :
                        x < 50.8 ? '#f03b20' :
                            '#f01010';
            };
            $scope.getFlightPlanColors = function () {
                return ['#ffeda0', '#feb24c', '#f03b20', '#f01010'];
            };

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

            var aspectLayer = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Aspect_tif1_tif/MapServer",
                zIndex: 200,
                maxZoom: 22,
                maxNativeZoom: 18
            });

            var slopeLayer = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/Slope_tif1/MapServer",
                zIndex: 200,
                maxZoom: 22,
                maxNativeZoom: 18
            });

            var hillshadeLayer = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/W47q82gM5Y2xNen1/arcgis/rest/services/HillSha_tif1/MapServer",
                zIndex: 200,
                maxZoom: 22,
                maxNativeZoom: 18
            });

            function getClassificationColor(className) {
                var color = "#FFFFFF"
                if (className === "Water") {
                    color = "#6699ff";
                }
                if (className === "Trees") {
                    color = "#006600";
                }
                if (className === "Shrub") {
                    color = "#009933";
                }
                if (className === "Agriculture") {
                    color = "#ffff00";
                }
                if (className === "Grass") {
                    color = "#33cc33";
                }
                if (className === "Road / Bare soil") {
                    color = "#9999ff";
                }

                return color;
            }

            function style(feature) {
                return {
                    //fillColor: getColor(feature.properties.crime_rate),
                    fillColor: getClassificationColor(feature.properties.Class),
                    weight: 0.5,
                    opacity: 1,
                    color: 'red',
                    dashArray: '0.1',
                    fillOpacity: 0.6
                };
            }

            function onEachFeature(feature, layer) {
                // does this feature have a property named popupContent?
                if (feature.properties && feature.properties.Class) {
                    layer.bindPopup(feature.properties.Class);
                }
            }

            var classificationLayer;

            shp("./app/resources/classification.zip").then(
                function (geojson) {
                    classificationLayer = L.geoJSON(geojson, {
                        style: style,
                        onEachFeature: onEachFeature
                    });
                    $scope.ctrl.addOverlay(classificationLayer, "Classification")
                });

            var descriptionBox = L.control({position: 'bottomleft'});
            var DEMLegend = L.control({position: 'bottomright'});

            var legendCenterButton = L.control({position: 'bottomright'});
            var flightPlanLegend = L.control({position: 'bottomright'});
            var classificationLegend = L.control({position: 'bottomright'});

            $scope.loadLegends = function () {
                /*Layers Legend*/
                descriptionBox.onAdd = function () {
                    var div = L.DomUtil.create('UAaSLayers', 'layers-description');

                    var overlayLayers = $scope.ctrl.getActiveOverlays();
                    var mosaicDisplayValue = "none";
                    var demDisplayValue = "none";
                    var floatingPointsDisplayValue = "none";
                    var falseColorDisplayValue = "none";
                    var hillshadeDisplayValue = "none";
                    var slopeDisplayValue = "none";
                    var ndviDisplayValue = "none";
                    var flightPlanDisplayValue = "none";
                    var aspectDisplayValue = "none";
                    var classificationDisplayValue = "none";

                    for (var overlayId in overlayLayers) {
                        // console.log(overlayLayers[overlayId].name);
                        var layerName = overlayLayers[overlayId].name;
                        if (layerName === 'Mosaic') {
                            mosaicDisplayValue = "";
                        }
                        if (layerName === 'DSM') {
                            demDisplayValue = "";
                        }

                        if (layerName === 'False Color') {
                            falseColorDisplayValue = "";
                        }

                        if (layerName === "Floating Points") {
                            floatingPointsDisplayValue = "";
                        }
                        if (layerName === "Flight Plan") {
                            flightPlanDisplayValue = "";
                        }
                        if (layerName === 'Hillshade') {
                            hillshadeDisplayValue = "";
                        }
                        if (layerName === 'Slope') {
                            slopeDisplayValue = "";
                        }
                        if (layerName === "NDVI") {
                            ndviDisplayValue = "";
                        }
                        if (layerName === "Aspect") {
                            aspectDisplayValue = "";
                        }
                        if (layerName === "Classification") {
                            classificationDisplayValue = "";
                        }
                    }


                    var valuesTable = '<span class="layer-description-title">Layers description:</span> <br>';
                    valuesTable += '<div class="layer-description-container">';

                    valuesTable += '<div id="Mosaic" style="display: ' + mosaicDisplayValue + '"><span>';
                    valuesTable += '<b>Mosaic:</b> Orthomosaic of RGB bands (Red, Green, Blue).';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="DSM" style="display: ' + demDisplayValue + '"><span>';
                    valuesTable += '<b>DSM:</b> Digital Surface Model of the the project area, dervied from overlapped images taken by the drone.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="NDVI" style="display: ' + ndviDisplayValue + '"><span>';
                    valuesTable += '<b>NDVI:</b> Normalized Difference Vegetation Index of the project area depicting the health condition of surrounding vegetation.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="FalseColor" style="display: ' + falseColorDisplayValue + '"><span>';
                    valuesTable += '<b>False Color:</b> A multisppectral image of the project area composed of five bands: Green, Red, Red Edge, NIR1, NIR2.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="FlightPlan" style="display: ' + flightPlanDisplayValue + '"><span>';
                    valuesTable += '<b>Flight Plan:</b> The path followed by the drone, displaying the route and the flight\'s altitude.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="Aspect" style="display: ' + aspectDisplayValue + '"><span>';
                    valuesTable += '<b>Aspect:</b> This layer displays the direction the slopes face to illustrate the surface terrain in the study area.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="Slope" style="display: ' + slopeDisplayValue + '"><span>';
                    valuesTable += '<b>Slope:</b> Derived from the DSM, this layer contains slope angle of project area to demonstrate topograpy.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="Hillshade" style="display: ' + hillshadeDisplayValue + '"><span>';
                    valuesTable += '<b>Hillshade:</b> This layer is a shaded relief raster created by the DSM and the sun angle.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="Classification" style="display: ' + classificationDisplayValue + '"><span>';
                    valuesTable += '<b>Classification:</b> A supervised classification of land use and land cover of the study area.';
                    valuesTable += '</span></div>';

                    valuesTable += '<div id="FloatingPoints" style="display: ' + floatingPointsDisplayValue + '"><span>';
                    valuesTable += '<b>Floating Points:</b> The experiment carried out by the Video Processing Group. The movement of three heat-emitting floating objects (visualized as markers) was used to measure the stream velocity of the River Aa with the aid of a thermal camera. Select in the timeslider the Experiment you wish to view and press "PLAY". ';
                    valuesTable += '</span></div>';


                    valuesTable += '</div>';

                    div.innerHTML += '<div ng-if="!screenIsXS">' + valuesTable + '</div>';

                    var linkFunction = $compile(angular.element(div));
                    var newScope = $scope.$new();

                    return linkFunction(newScope)[0];

                    return div;
                };
                descriptionBox.addTo(map); //Added by default
                /*End DEM Legend*/

                /*DEM Legend*/
                DEMLegend.onAdd = function () {
                    var div = L.DomUtil.create('DEM', 'DEM-legend');

                    div.innerHTML = '<b>DSM Scale (m)</b> <br>';
                    var valuesTable = '<div class="">';
                    valuesTable += '<table style=\"width: 100%;\">';
                    valuesTable += '<tr>';
                    valuesTable += '<td style=\"text-align: left;\">';
                    valuesTable += '<span>0</span>';
                    valuesTable += '</td>';
                    valuesTable += '<td style=\"text-align: right;\">';
                    valuesTable += '<span>17</span>';
                    valuesTable += '</td>';
                    valuesTable += '</tr>';
                    valuesTable += '</table>';
                    valuesTable += '</div>';

                    div.innerHTML += valuesTable;
                    div.innerHTML += '<div class="dem-rainbow"></div>';

                    return div;
                };
                // DEMLegend.addTo(map); //Added by default
                /*End DEM Legend*/

                /*Flight Plan Legend*/
                flightPlanLegend.onAdd = function () {
                    var div = L.DomUtil.create('fligthPlandLegend', 'flight-plan-legend');

                    div.innerHTML = '<b>Flight Plan Altitude (m): </b>' + '<br>';

                    var colors = $scope.getFlightPlanColors();

                    var grades = [0, 46, 48.1, 50.8];

                    for (var i = 0; i < colors.length; i++) {
                        div.innerHTML +=
                            '<i style="background:' + colors[i] + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }

                    return div;
                };

                /*Classification Legend*/
                classificationLegend.onAdd = function () {
                    var div = L.DomUtil.create('fligthPlandLegend', 'flight-plan-legend');

                    div.innerHTML = '<b>Classification: </b>' + '<br>';

                    var classType = ["Agriculture", "Grass", "Road / Bare soil", "Shrub", "Trees", "Water"];

                    for (var i = 0; i < classType.length; i++) {
                        div.innerHTML +=
                            '<i style="background:' + getClassificationColor(classType[i]) + '"></i> ' +
                            classType[i] + '<br>';
                    }

                    return div;
                };

                /*Zoom button*/
                legendCenterButton.onAdd = function () {
                    var div = L.DomUtil.create('center', 'center-button');

                    var zooming = '<span ng-click="zoomRiver()">';
                    zooming += '<img style="width: 24px; height: 24px;" src="app/components/assets/button_icons/meeting-point-32.png"/>';
                    zooming += '</span>';
                    div.innerHTML = zooming;

                    var linkFunction = $compile(angular.element(div));
                    var newScope = $scope.$new();

                    return linkFunction(newScope)[0];
                };
                legendCenterButton.addTo(map); //Added by default
                /*End Zoom button*/
            }

            $scope.activateDescription = function (layerName) {
                if (layerName === 'Mosaic') {
                    $("#Mosaic").css("display", "");
                }
                if (layerName === 'DSM') {
                    $("#DSM").css("display", "");
                }
                if (layerName === "Floating Points") {
                    $("#FloatingPoints").css("display", "");
                }
                if (layerName === "NDVI") {
                    $("#NDVI").css("display", "");
                }
                if (layerName === "False Color") {
                    $("#FalseColor").css("display", "");
                }
                if (layerName === "Aspect") {
                    $("#NDVI").css("display", "");
                }
                if (layerName === "Slope") {
                    $("#NDVI").css("display", "");
                }
                if (layerName === "Hillshade") {
                    $("#NDVI").css("display", "");
                }
                if (layerName === "Classification") {
                    $("#Classification").css("display", "");
                }
            }

            $scope.deactivateDescription = function (layerName) {
                if (layerName === 'Mosaic') {
                    $("#Mosaic").css("display", "none");
                }
                if (layerName === 'DSM') {
                    $("#DSM").css("display", "none");
                }
                if (layerName === "Floating Points") {
                    $("#FloatingPoints").css("display", "none");
                }
                if (layerName === "NDVI") {
                    $("#NDVI").css("display", "none");
                }
                if (layerName === "False Color") {
                    $("#FalseColor").css("display", "none");
                }
                if (layerName === "Aspect") {
                    $("#Aspect").css("display", "none");
                }
                if (layerName === "Slope") {
                    $("#Slope").css("display", "none");
                }
                if (layerName === "Hillshade") {
                    $("#Hillshade").css("display", "none");
                }
                if (layerName === "Classification") {
                    $("#Classification").css("display", "none");
                }
            }

            // all available markers
            $scope.markerpts = [
                [], //straight 1
                [], //straight 2
                [] // straight 3
            ];

            // set of markers of current selected floating experiment
            $scope.selectedMarkers = [];

            // load csv data for floating pts:
            $scope.dataAll = [];
            $scope.data;
            $scope.markerdata = [];
            $.ajax({
                url: "app/components/assets/floating/straight1.csv",
                async: false,
                success: function (csvd) {
                    $scope.data = $.csv.toArrays(csvd);
                },
                dataType: "text",
                complete: function () {
                    // call a function on complete
                    var ms = 0;
                    var mins = 0;
                    var secs = 0;
                    var videoStamp = "0:00";
                    for (var i = 0; i < $scope.data.length; i++) {
                        var partsOfStr = $scope.data[i][0].split(';');
                        if (i === 0) {
                            ms = 0;
                        } else {
                            ms = Number(partsOfStr[2]);
                        }
                        mins = (ms / 1000 / 60) << 0;
                        secs = Math.floor((ms / 1000) % 60);
                        if (secs < 10) {
                            videoStamp = "" + mins + ":0" + secs;
                        } else {
                            videoStamp = "" + mins + ":" + secs;
                        }
                        var obj = {
                            lng: partsOfStr[0],
                            lat: partsOfStr[1],
                            time: videoStamp,
                        };
                        $scope.markerdata.push(obj);
                        $scope.markerpts[0][i] = new L.marker(
                            [obj.lng, obj.lat],
                            {icon: orangeIcon}
                        ).bindPopup('Time: ' + videoStamp);
                    }
                    $scope.dataAll.push($scope.markerdata);
                    $scope.markerdata = [];
                    $.ajax({
                        url: "app/components/assets/floating/straight2.csv",
                        async: false,
                        success: function (csvd) {
                            $scope.data = $.csv.toArrays(csvd);
                        },
                        dataType: "text",
                        complete: function () {
                            var ms = 0;
                            var mins = 0;
                            var secs = 0;
                            var videoStamp = "0:00";
                            // call a function on complete
                            for (var i = 0; i < $scope.data.length; i++) {
                                var partsOfStr = $scope.data[i][0].split(';');
                                if (i === 0) {
                                    ms = 0;
                                } else {
                                    ms = Number(partsOfStr[2]);
                                }
                                mins = (ms / 1000 / 60) << 0;
                                secs = Math.floor((ms / 1000) % 60);
                                if (secs < 10) {
                                    videoStamp = "" + mins + ":0" + secs;
                                } else {
                                    videoStamp = "" + mins + ":" + secs;
                                }
                                var obj = {
                                    lng: partsOfStr[0],
                                    lat: partsOfStr[1],
                                    time: partsOfStr[2],
                                };
                                $scope.markerdata.push(obj);
                                $scope.markerpts[1][i] = new L.marker(
                                    [obj.lng, obj.lat],
                                    {icon: tealIcon}
                                ).bindPopup('Time: ' + videoStamp);
                            }
                            $scope.dataAll.push($scope.markerdata);
                            $scope.markerdata = [];
                            $.ajax({
                                url: "app/components/assets/floating/straight3.csv",
                                async: false,
                                success: function (csvd) {
                                    $scope.data = $.csv.toArrays(csvd);
                                },
                                dataType: "text",
                                complete: function () {
                                    var ms = 0;
                                    var mins = 0;
                                    var secs = 0;
                                    var videoStamp = "0:00";
                                    // call a function on complete
                                    for (var i = 0; i < $scope.data.length; i++) {
                                        if (i === 0) {
                                            ms = 0;
                                        } else {
                                            ms = Number(partsOfStr[2]);
                                        }
                                        mins = (ms / 1000 / 60) << 0;
                                        secs = Math.floor((ms / 1000) % 60);
                                        if (secs < 10) {
                                            videoStamp = "" + mins + ":0" + secs;
                                        } else {
                                            videoStamp = "" + mins + ":" + secs;
                                        }
                                        var partsOfStr = $scope.data[i][0].split(';');
                                        var obj = {
                                            lng: partsOfStr[0],
                                            lat: partsOfStr[1],
                                            time: partsOfStr[2],
                                        };
                                        $scope.markerdata.push(obj);
                                        $scope.markerpts[2][i] = new L.marker(
                                            [obj.lng, obj.lat],
                                            {icon: purpleIcon}
                                        ).bindPopup('Time: ' + videoStamp);
                                    }
                                    $scope.dataAll.push($scope.markerdata);
                                    $scope.markerdata = [];
                                }
                            });
                        }
                    });
                }
            });

            $scope.numberPoints = $scope.markerpts[$scope.selectedFloatingData].length - 1;

            // those markers, being currently on map:
            $scope.addedMarkers = {};
            for (var i = 0; i <= $scope.markerpts[$scope.selectedFloatingData].length; i++)
                $scope.addedMarkers[i] = false;

            $scope.slider.value = 0;

            $scope.showMarkers = function () {
                var i = $scope.slider.value;
                // add current marker:
                $scope.markerpts[$scope.selectedFloatingData][i].addTo(map);
                $scope.addedMarkers[i] = true;
                // update videoStamp time:
                $scope.videoTime = $scope.markerpts[$scope.selectedFloatingData][i].getPopup()._content.substr(6);
                // remove previous marker:
                for (var j = 0; j < i; j++)
                    if ($scope.addedMarkers[j]) {
                        $scope.markerpts[$scope.selectedFloatingData][j].remove(map);
                        $scope.addedMarkers[j] = false;
                    }
                for (var j = i + 1; j <= $scope.numberPoints; j++)
                    if ($scope.addedMarkers[j]) {
                        $scope.markerpts[$scope.selectedFloatingData][j].remove(map);
                        $scope.addedMarkers[j] = false;
                    }
            };

            $scope.unloadMarkers = function () {
                for (var i = 0; i <= $scope.markerpts[$scope.selectedFloatingData].length; i++) {
                    if ($scope.addedMarkers[i])
                        $scope.markerpts[$scope.selectedFloatingData][i].remove(map);
                }
                ;
            };
            $scope.loadMarkers = function () {
                for (var i = 0; i <= $scope.markerpts[$scope.selectedFloatingData].length; i++) {
                    if ($scope.addedMarkers[i])
                        $scope.markerpts[$scope.selectedFloatingData][i].addTo(map);
                }
                ;
            };

            var markersDummyLayer = L.layerGroup([]);

            $scope.overlays = {
                "Mosaic": MosaicLayer,
                "DSM": DSM,
                "NDVI": NDVILayer,
                "False Color": falseColorLayer,
                "Flight Plan": flightPlanLayer,
                "Aspect": aspectLayer,
                "Slope": slopeLayer,
                "Hillshade": hillshadeLayer,
                //"Classification": classificationLayer, # must be added from the shp function
                "Floating Points": markersDummyLayer
            };

            $scope.ctrl = L.control.layers(baseLayers, $scope.overlays);
            //$scope.ctrl = L.control.activeLayers(baseLayers, $scope.overlays);
            $scope.ctrl.addTo(map);

            $scope.showMarkers();
            $scope.unloadMarkers();
            $scope.loadLegends();

            $scope.onOverlayAdd = function (e) {
                if (e.name === 'Mosaic') {
                    $("#Mosaic").css("display", "");
                    $scope.zoomRiver();
                }
                if (e.name === 'DSM') {
                    map.removeControl(DEMLegend);
                    DEMLegend.addTo(map);
                    $("#DSM").css("display", "");
                    $scope.zoomRiver();
                }
                if (e.name === "Floating Points") {
                    // 1. add all markers
                    $scope.loadMarkers();

                    // 2. make slider available
                    $scope.my.slidershow = true;

                    // 3. change size of map
                    $rootScope.sliderheight = 60;

                    $("#FloatingPoints").css("display", "");

                    // 4. change viewport to current selected Experiment

                    $scope.playPressed = false;
                    // 1. unload previous markers
                    for (var i = 0; i <= $scope.markerpts[$scope.previousSelectedFloatingData].length; i++) {
                        if ($scope.addedMarkers[i]) {
                            $scope.markerpts[$scope.previousSelectedFloatingData][i].remove(map);
                            $scope.addedMarkers[i] = false;
                        }
                    }
                    // 2. load current markers
                    $scope.addedMarkers[0] = true; // run from start
                    for (var i = 0; i <= $scope.markerpts[$scope.selectedFloatingData].length; i++) {
                        if ($scope.addedMarkers[i]) {
                            $scope.markerpts[$scope.selectedFloatingData][i].addTo(map);
                        }
                    }
                    // 3. reload slider data
                    $scope.slider.value = 0;
                    // 4. zoom to map excerpt of selected experiment:
                    map.setView($scope.centerExperiments[$scope.selectedFloatingData], 21);

                    $timeout(function () {
                            window.dispatchEvent(new Event('resize'));
                        },
                        200);

                    $scope.previousSelectedFloatingData = $scope.selectedFloatingData;
                }

                if (e.name === "Flight Plan") {
                    $("#FlightPlan").css("display", "");
                    flightPlanLegend.addTo(map);
                    $scope.zoomRiver();
                }

                if (e.name === 'NDVI') {
                    $("#DSM").css("display", "");
                    $scope.zoomRiver();
                }

                if (e.name === 'False Color') {
                    $("#FalseColor").css("display", "");
                    $scope.zoomRiver();
                }

                if (e.name === 'Aspect') {
                    $("#Aspect").css("display", "");
                    $scope.zoomRiver();
                }

                if (e.name === 'Slope') {
                    $("#Slope").css("display", "");
                    $scope.zoomRiver();
                }

                if (e.name === 'Hillshade') {
                    $("#Hillshade").css("display", "");
                    $scope.zoomRiver();
                }

                if (e.name === 'Classification') {
                    $("#Classification").css("display", "");
                    classificationLegend.addTo(map);
                    $scope.zoomRiver();
                }

                map.removeControl(legendCenterButton);
                legendCenterButton.addTo(map);

                var overlayLayers = $scope.ctrl.getActiveOverlays();
                for (var overlayId in overlayLayers) {
                    console.log(overlayLayers[overlayId].name);
                    $scope.activateDescription(overlayLayers[overlayId].name);
                }
                if (overlayLayers.length > 0) {
                    descriptionBox.addTo(map);
                }

                // 4. update window:
                $timeout(function () {
                        window.dispatchEvent(new Event('resize'));
                    },
                    200);

            };
            $scope.onOverlayRemove = function (e) {
                if (e.name === 'Mosaic') {
                    $("#Mosaic").css("display", "none");
                }
                if (e.name === 'DSM') {
                    map.removeControl(DEMLegend);
                    $("#DSM").css("display", "none");
                }
                if (e.name === "Floating Points") {
                    // stop autoplay:
                    $scope.playPressed = false;

                    // 1. remove all markers
                    $scope.unloadMarkers();

                    // 2. make slider unavailable
                    $scope.my.slidershow = false;

                    // 3. change size of map
                    $rootScope.sliderheight = 0;
                    $("#FloatingPoints").css("display", "none");
                }

                if (e.name === "Flight Plan") {
                    map.removeControl(flightPlanLegend);
                    $("#FlightPlan").css("display", "none");
                }
                if (e.name === 'NDVI') {
                    $("#NDVI").css("display", "none");
                }
                if (e.name === 'False Color') {
                    $("#FalseColor").css("display", "none");
                }

                if (e.name === 'Aspect') {
                    $("#Aspect").css("display", "none");
                }

                if (e.name === 'Slope') {
                    $("#Slope").css("display", "none");
                }

                if (e.name === 'Hillshade') {
                    $("#Hillshade").css("display", "none");
                }

                if (e.name === 'Classification') {
                    map.removeControl(classificationLegend);
                    $("#Classification").css("display", "none");
                }

                map.removeControl(legendCenterButton);
                legendCenterButton.addTo(map);

                var overlayLayers = $scope.ctrl.getActiveOverlays();
                if (overlayLayers.length == 0) {
                    map.removeControl(descriptionBox);
                }

                // 4. update window:
                $timeout(function () {
                        window.dispatchEvent(new Event('resize'));
                    },
                    200);
            };

            map.on('overlayadd', $scope.onOverlayAdd);
            map.on('overlayremove', $scope.onOverlayRemove);

        }; //end of createMap Function

        $scope.timeInterval = 20; // 20ms for data rows 0 - 699; rest 40ms.

        $scope.videoTime = "0:00";
        function forwardSlider() {
            setTimeout(function () {
                var current = $scope.slider.value + 1;
                // recursion end?
                if ($scope.playPressed & (current < $scope.markerpts[$scope.selectedFloatingData].length)) {
                    // go next marker
                    $scope.slider.value = current;
                    $scope.markerpts[$scope.selectedFloatingData][current].addTo(map);
                    $scope.addedMarkers[current] = true;
                    // update videoStamp time:
                    $scope.videoTime = $scope.markerpts[$scope.selectedFloatingData][current].getPopup()._content.substr(6);
                    // remove previous marker
                    $scope.markerpts[$scope.selectedFloatingData][current - 1].remove(map);
                    $scope.addedMarkers[current - 1] = false;
                    // recursive op:
                    forwardSlider();
                } else {
                    $scope.playPressed = false;
                }
                // update selection in slider:
                window.dispatchEvent(new Event('resize'));
                if (current >= 700)
                    $scope.timeInterval = 40;
                else
                    $scope.timeInterval = 20;
            }, $scope.timeInterval * $scope.videoSpeed);// milliseconds timeout before show next:
        }
        ;

        $scope.playPressed = false;
        $scope.videoSpeed = 1;

        $scope.playSlider = function () {
            $scope.playPressed = !$scope.playPressed;
            if ($scope.playPressed) {
                if ($scope.slider.value >= $scope.numberPoints) {
                    $scope.slider.value = 0;
                    // undo markers:
                    for (var i = 1; i <= $scope.markerpts[$scope.selectedFloatingData].length; i++)
                        if ($scope.addedMarkers[i]) {
                            $scope.addedMarkers[i] = false;
                            $scope.markerpts[$scope.selectedFloatingData][i].remove(map);
                        }
                }
                forwardSlider();
            }
        };

        $scope.previousSelectedFloatingData = 0;
        $scope.selectedFloatingData = 0;
        $scope.centerExperiments = [
            [51.944671, 7.573111],
            [51.944698, 7.573128],
            [51.944716, 7.573150]
        ];
        $scope.vidDataChanged = function () {
            if ($scope.previousSelectedFloatingData !== $scope.selectedFloatingData) {
                $scope.playPressed = false;
                // 1. unload previous markers
                for (var i = 0; i <= $scope.markerpts[$scope.previousSelectedFloatingData].length; i++) {
                    if ($scope.addedMarkers[i]) {
                        $scope.markerpts[$scope.previousSelectedFloatingData][i].remove(map);
                        $scope.addedMarkers[i] = false;
                    }
                }
                // 2. load current markers
                $scope.addedMarkers[0] = true; // run from start
                for (var i = 0; i <= $scope.markerpts[$scope.selectedFloatingData].length; i++) {
                    if ($scope.addedMarkers[i]) {
                        $scope.markerpts[$scope.selectedFloatingData][i].addTo(map);
                    }
                }
                // 3. reload slider data
                $scope.slider.value = 0;
                // 4. zoom to map excerpt of selected experiment:
                map.setView($scope.centerExperiments[$scope.selectedFloatingData], 21);
                // 5. set videotime back to 0:00:
                $scope.videoTime = "0:00";
                $timeout(function () {
                        window.dispatchEvent(new Event('resize'));
                    },
                    200);
                $scope.previousSelectedFloatingData = $scope.selectedFloatingData;
            }
        };

        $scope.slider = {value: 0};

        $scope.createMap();

        $scope.slider = {
            id: 'slider-id',
            value: 0,
            options: {
                floor: 0,
                ceil: $scope.numberPoints,
                id: 'slider-id',
                onStart: function (id) {
                },
                onChange: function (id) {
                    $scope.showMarkers();
                },
                onEnd: function (id) {
                }, translate: function (value) {
                    return '';
                },
                getPointerColor: function (value) {
                    if ($scope.selectedFloatingData == 0)
                        return '#FF7700';
                    if ($scope.selectedFloatingData == 1)
                        return '#00FFFF';
                    if ($scope.selectedFloatingData == 2)
                        return '#9C00FF';
                    return '#FF7700';
                }
            }
        };

        $scope.slider.value = 0;

        $scope.zoomRiver = function () {
            map.setView([51.944990, 7.572810], 17);
        };

        $timeout(function () {
                window.dispatchEvent(new Event('resize'));
            },
            200);
    }])
