// Declare variables and constants
var express = require('express');
var app = express();
const port = process.env.PORT || 5000;   //Define port
const path = require('path');
const keys = require('./config/keys');  //imports username and password from keys.js
var bodyParser = require("body-parser");   //body-parser package necessary for JSON parsing

app.use(bodyParser.json({type: 'application/json'}));

console.log("Starting server");

// Declare static folders for the server
app.use(express.static(path.join(__dirname + '/modules')));
app.use(express.static(path.join(__dirname + '/node_modules')));

// Allow cross origin
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Set port
app.set('port', port);

// View engine for rendering html
var engine = require('consolidate');
app.engine('html', engine.mustache);
app.set('view engine', 'html');

// Request app rendering
app.get('/', function(req, res) {
  console.log("starting request")
  res.render(path.join(__dirname + '/index.html'));
});

// Declare authentication variables (import from keys.js)
var loginName = keys.users.username;
var loginPassword = keys.users.password;

// Check if user input data corresponds to credentials
app.post('/login', function(req, res, next){
  if (loginName == req.body.username && loginPassword == req.body.password){
    // Render if they correspond
    res.render(path.join(__dirname + '/index.html'));
  }else{
  }
})

// Print if server is listening
app.listen(port, function() {
  console.log("You've been served!")
  console.log("Node app is running at localhost:" + app.get('port'))
});
