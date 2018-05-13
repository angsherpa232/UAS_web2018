var express = require('express');
var app = express();
const port = process.env.PORT || 5000
const path = require('path')

console.log("Starting server")

// Allow cross origin
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('port', port);

app.get('/', function(req, res) {
  console.log("starting request")
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

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
