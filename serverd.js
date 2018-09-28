// Declare variables and constants
const express = require('express');
const app = express();
const path = require('path');
const keys = require('./config/keys');  //imports username and password from keys.js
const bodyParser = require("body-parser");   //body-parser package necessary for JSON parsing

app.use(bodyParser.json({type: 'application/json'}));

// Declare static folders for the server
app.use(express.static(path.join(__dirname + '/modules')));
app.use(express.static(path.join(__dirname + '/node_modules')));

// Allow cross origin
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// View engine for rendering html
var engine = require('consolidate');
app.engine('html', engine.mustache);
app.set('view engine', 'html');

// Request app rendering
app.get('/', function(req, res) {
  res.render(path.join(__dirname + '/index.html'));
});

// Declare authentication variables (import from keys.js)
const loginName = keys.users.username;
const loginPassword = keys.users.password;

// Check if user input data corresponds to credentials
app.post('/login', (req, res)=>{
  if (loginName == req.body.username && loginPassword == req.body.password){
    // Render if they correspond
    res.render(path.join(__dirname + '/index.html'));
  }else{
  }
})

//Define port
const port = process.env.PORT || 5000;   

// Print if server is listening
app.listen(port, ()=> {
  console.log(`Node app is running at port ${port}`)
});
