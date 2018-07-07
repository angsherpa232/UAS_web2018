# ELIPPSS

ELIPPSS web portal is a web application developed in the scope of the Unmanned Aerial Systems course at the [Institute for Geoinformatics](https://www.uni-muenster.de/Geoinformatics/en/) in 2018. In groups the students applied various monitoring and exploratory approaches to assess the environment at the study area, a segment of the Aa river just west of Münster, Germany. The technologies applied range from unmanned aerial vehicles ([drones](https://www.microdrones.com/en/)) to terrestrial [LiDAR](https://www.kickstarter.com/projects/scanse/sweep-scanning-lidar) to [senseBox](https://www.sensebox.de/) in-situ ground stations.
ELIPPSS is a mostly open source project that provides access to the data produced in the field. It includes a simple WebGIS interactive map, where users can toggle between the raster and vector data produced by some of the project groups.

## Getting Started

ELIPPSS was developed in HTML, CSS, javascript. It launches its own node express server and was test deployed on [Heroku](https://www.heroku.com/) web hosting service.

### Prerequisites

The following web technologies are necessary to run this application


[node.js](https://nodejs.org/en/)
[git][https://git-scm.com/downloads]


### Installing

From your console (e.g. cmd or GitBash) first clone the repository:

```
git clone https://github.com/angsherpa232/UAS_web2018

```

Install the necessary node modules (specified in [package.json](https://github.com/angsherpa232/UAS_web2018/blob/master/package.json)) using:

```
npm install
```




## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
