//Process controllers

angular.module('UAS_2018')

.controller('uas2018_process_controller', ['$scope', function($scope) {
////Load map when the processing tab is opened for the first time /////
var imagery = L.esri.basemapLayer("Imagery");
var geojsonLayer;
// Main map object
var map = L.map('map', {
  center: [51.944990, 7.572810],
  zoom: 17,
  layers: [imagery],
  maxZoom: 21,
  maxNativeZoom: 19
});

var mapHome = {
  lat: 51.944990,
  lng: 7.572810,
  zoom: 17
};

// Default base layers when the app initiates
var baseLayers = {
  "Imagery": imagery
};

/// Holding the buffer layers ///////
  var assetLayerGroup = L.layerGroup().addTo(map);

//// Retrieving geojson file begins ///////
var dataURL = "./home/resources/markers_process.geojson"
$.ajax({
  url: dataURL,
  async: false,
  success: function(response) {
      demoPoints = L.geoJson(response).addTo(map);
      map.fitBounds(demoPoints.getBounds());
  }
}).responseJSON

////// Map loading session ends here ////////


/// Buffer input begins //////
$scope.buffer_radius = '';
$scope.bufferFunction = function () {
    if ($scope.buffer_radius == ''){
      $scope._value='btn btn-primary disabled';
    } else {
      $scope._value='btn btn-primary enabled';
    }
}


/// Buffer input end /////

/// Execute buffer begins///
$scope.executeBuffer = function () {
  if ($scope.buffer_radius != ''){
//// Execute buffer ends /////

  /////// wps service begin /////////
    var wpsService = new WpsService({
      url: "http://geoprocessing.demo.52north.org:8080/wps/WebProcessingService",
      version: "2.0.0"
    });

    var capabilities,data_,jobId,
      processDescription;
    //Execute process callback function
    var executeCallback = function (response){
    	var status = response.executeResponse.responseDocument.status;
    	if (status == "Accepted"){
    	jobId = response.executeResponse.responseDocument.jobId;
    	return jobId;
    	}
    };

    setTimeout(function(){wpsService.getStatus_WPS_2_0(statusCallback, jobId)},1350);

////// $scope.plot first parse the callback returned string and then plot ///////
    $scope.plot = function(d){
              geojsonLayer = L.geoJson(JSON.parse(d)).addTo(assetLayerGroup);
              map.fitBounds(geojsonLayer.getBounds());
  }

  $scope.clearBuffer = function (){
    assetLayerGroup.clearLayers();

  }

    var resultCallback = function(response){
      // console.log(response);
      data_ = response.executeResponse.responseDocument.outputs[0].data.complexData.value;
  ///////// $scope.plot the callback returned object to map /////////
      $scope.plot(data_);
    }



    var statusCallback = function(response){
      <!-- var jobId = response.executeResponse.responseDocument.jobId; -->
      var status = response.executeResponse.responseDocument.status;
      if (status == "Succeeded"){
    	wpsService.getResult_WPS_2_0(resultCallback,jobId);
      alert('Success');
      }
      else {
    	alert('Oops! something went wrong, please try again.');
      }
    }

    /////////////////// INPUT //////////////////////
    //Input generator for literal dataType
    var inputGenerator = new InputGenerator();
    //Literal input
    // var literalInput = inputGenerator.createLiteralDataInput_wps_1_0_and_2_0(identifier, dataType, uom, value);
    var literalInput = inputGenerator.createLiteralDataInput_wps_1_0_and_2_0('width', 'xs:double', 'meters', parseInt($scope.buffer_radius)/100000);

    //Input generator for complex dataType
    //Complex dataType
    // var complexInput = inputGenerator.createComplexDataInput_wps_1_0_and_2_0(identifier,
    // 					mimeType, schema, encoding, asReference, complexPayload);
    var complexInput = inputGenerator.createComplexDataInput_wps_1_0_and_2_0('data',
    					'application/vnd.geo+json', undefined, undefined, true, 'https://api.myjson.com/bins/wteyi');


    ////////////////// OUTPUT /////////////////////
    //Output generator for complex dataType
    var outputGenerator = new OutputGenerator();

    // var complexOutput = outputGenerator.createComplexOutput_WPS_2_0(identifier, mimeType, schema,
    // 			encoding, transmission);
    var complexOutput = outputGenerator.createComplexOutput_WPS_2_0('result', 'application/vnd.geo+json', undefined,
    			undefined, 'value');


    // wpsService.getCapabilities_GET(capabilitiesCallback);
    // wpsService.describeProcess_GET(describeProcessCallback,'org.n52.wps.server.algorithm.SimpleBufferAlgorithm');

    //WPS execute
    // wpsService.execute(callbackFunction, processIdentifier, responseFormat, executionMode, lineage, inputs, outputs);
    wpsService.execute(executeCallback, 'org.n52.wps.server.algorithm.SimpleBufferAlgorithm', 'document', 'async', false, [literalInput,complexInput], [complexOutput]);
  }
}
/////// wps service ends /////////
}])
