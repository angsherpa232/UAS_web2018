var express = require('express');
var app = express();
const port = process.env.PORT || 5000;
const path = require('path');
const keys = require('./config/keys');
var bodyParser = require("body-parser");
app.use(bodyParser.json({type: 'application/json'}));

var bodyParser = require("body-parser");
app.use(bodyParser.json());

console.log("Starting server");

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

//View engine for rendering html
var engine = require('consolidate');
app.engine('html', engine.mustache);
app.set('view engine', 'html');

app.get('/', function(req, res) {
  console.log("starting request")
  res.render(path.join(__dirname + '/index.html'));
});


var loginName = keys.users.username;
var loginPassword = keys.users.password;

app.post('/login', function(req, res, next){

  if (loginName == req.body.username && loginPassword == req.body.password){
    res.render(path.join(__dirname + '/index.html'));
  }else{
  }
})

app.listen(port, function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
