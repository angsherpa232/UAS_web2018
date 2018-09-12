# ELIPPSS

ELIPPSS web portal is a web application developed in the scope of the Unmanned Aerial Systems course at the [Institute for Geoinformatics](https://www.uni-muenster.de/Geoinformatics/en/) in 2018. In groups the students applied various monitoring and exploratory approaches to assess the environment at the study area, a segment of the Aa river just west of Münster, Germany. The applied technologies range from unmanned aerial vehicles ([drones](https://www.microdrones.com/en/)) to terrestrial [LiDAR](https://www.kickstarter.com/projects/scanse/sweep-scanning-lidar) to [senseBox](https://www.sensebox.de/) in-situ ground stations.
ELIPPSS is a mostly open source project that provides access to the data produced in the field. It includes a simple WebGIS interactive map, where users can toggle between the raster and vector data produced by some of the project groups. It also features a simple, proof-of-concept WPS service, based on [wps-js](https://github.com/52North/wps-js) by [52north](https://52north.org/)

## Getting Started

ELIPPSS was developed in HTML, CSS, javascript. It launches its own node express server [serverd.js](https://github.com/angsherpa232/UAS_web2018/blob/master/serverd.js) and is  deployed on [Heroku](https://www.heroku.com/) web hosting service (though it can be deployed on any server). The app has a stand-alone authentication system, so user accessibility can be controlled on any server the app is deployed on. The user input in the login-page is sent to the server via HTTP-request and compared to the login-credentials in [keys.js](https://github.com/angsherpa232/UAS_web2018/blob/master/config/keys.js). Most components of the authentication system can be found in [authentication](https://github.com/angsherpa232/UAS_web2018/tree/master/modules/authentication). The core WPS components lie in [processing](https://github.com/angsherpa232/UAS_web2018/tree/master/modules/processing). The main UI components are in [home](https://github.com/angsherpa232/UAS_web2018/tree/master/modules/home). [app.js](https://github.com/angsherpa232/UAS_web2018/blob/master/modules/app.js) contains core functionalities and [2d_map_controller](https://github.com/angsherpa232/UAS_web2018/blob/master/modules/2d_map/2d_map_controller.js) includes the controllers for the data explorer. All contents are rendered in [index.html](https://github.com/angsherpa232/UAS_web2018/blob/master/index.html) in an ng-view HTML-tag by AngularJS.

### Prerequisites

The following web technologies are necessary to run this application


[node.js](https://nodejs.org/en/)<br/>
[git](https://git-scm.com/downloads)


### Installing

From your console (e.g. cmd or GitBash) first clone the repository and enter the app root directory:

```
git clone https://github.com/angsherpa232/UAS_web2018
cd UAS_web2018
```

Install the necessary node modules (specified in [package.json](https://github.com/angsherpa232/UAS_web2018/blob/master/package.json)) using:

```
npm install
```

Optional: We recommend installing nodemon so you avoid having to restart the server every time you modify the project. This is very useful for testing.

```
npm install nodemon -g
```

## Running

To run the application, from the root directory, run:

```
node serverd.js
```

If you use nodemon, run:

```
nodemon serverd.js
```

Open your web browser and view the app at ```localhost:5000``` or ```127.0.0.1:5000```

Click to see a [demo](http://elippss.herokuapp.com) of the app (does not require authentication).


## Authors

Ang Dawa Sherpa (angsherpa232@gmail.com)<br/>
Fana Gebremeskel (fani06mit@gmail.com)<br/>
Matheus S. Barros (matheus.eco.2010@gmail.com)<br/>
Daniel Marsh-Hunn (al373405@uji.es)
