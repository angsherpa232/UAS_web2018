# ELIPPSS

ELIPPSS web portal is a web application developed in the scope of the Unmanned Aerial Systems course at the [Institute for Geoinformatics](https://www.uni-muenster.de/Geoinformatics/en/) in 2018. In groups the students applied various monitoring and exploratory approaches to assess the environment at the study area, a segment of the Aa river just west of Münster, Germany. The technologies applied range from unmanned aerial vehicles ([drones](https://www.microdrones.com/en/)) to terrestrial [LiDAR](https://www.kickstarter.com/projects/scanse/sweep-scanning-lidar) to [senseBox](https://www.sensebox.de/) in-situ ground stations.
ELIPPSS is a mostly open source project that provides access to the data produced in the field. It includes a simple WebGIS interactive map, where users can toggle between the raster and vector data produced by some of the project groups.

## Getting Started

ELIPPSS was developed in HTML, CSS, javascript. It launches its own node express server and was test deployed on [Heroku](https://www.heroku.com/) web hosting service.

### Prerequisites

The following web technologies are necessary to run this application


[node.js](https://nodejs.org/en/)<br/>
[git](https://git-scm.com/downloads)


### Installing

From your console (e.g. cmd or GitBash) first clone the repository and enter the app root directory:

```
git clone https://github.com/angsherpa232/UAS_web2018
cd UASapp_2018
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

Find the username and password in [keys.js](https://github.com/angsherpa232/UAS_web2018/blob/master/config/keys.js)


## Authors

Ang Dawa Sherpa (angsherpa232@gmail.com)<br/>
Fana Gebremeskel (fani06mit@gmail.com)<br/>
Matheus S. Barros (matheus.eco.2010@gmail.com)<br/>
Daniel Marsh-Hunn (al373405@uji.es)
