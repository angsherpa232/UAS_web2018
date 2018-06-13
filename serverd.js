var express = require('express');
var app = express();
const port = process.env.PORT || 5000;
const path = require('path');
const keys = require('./config/keys');
var bodyParser = require("body-parser");
app.use(bodyParser.json({type: 'application/json'}));

console.log(keys)

var bodyParser = require("body-parser");
app.use(bodyParser.json());

/* var logfmt = require('logfmt'); */
/* var wh = require('connect-wwwhisper'); */
console.log("Starting server");

/* app.use(logfmt.requestLogger()); */

//var logfmt = require('logfmt');
//var wh = require('connect-wwwhisper');
console.log("Starting server");

//app.use(logfmt.requestLogger());
//app.use(wh());

app.use(express.static(path.join(__dirname + '/modules')));
app.use(express.static(path.join(__dirname + '/css')));
app.use(express.static(path.join(__dirname + '/scripts')));
app.use(express.static(path.join(__dirname + '/node_modules')));



// Allow cross origin
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('port', port);
app.set('views', __dirname + "/views")

//View engine for rendering html
var engine = require('consolidate');
app.engine('html', engine.mustache);
app.set('view engine', 'html');

app.get('/', function(req, res) {
  console.log("starting request")
  res.render(path.join(__dirname + '/index.html'));
});


var loginName = 'test';
var loginPassword = 'test';

app.post('/login', function(req, res, next){

  if (loginName == req.body.username && loginPassword == req.body.password){
    res.render(path.join(__dirname + '/index.html'));
  }else{
  }
})




app.listen(port, function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

// app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


// express()
//   .use(express.static(path.join(__dirname, '/index.html')))
//   .set('views', path.join(__dirname, 'views'))
//   //.set('view engine', 'html')
//   .get('/', (req, res) => res.render('index.html'))
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`))
