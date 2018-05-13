const express = require('express')
const path = require('path')
const port = process.env.PORT || 5000
var app = express()

console.log("Starting server")

app.get('/', function(req, res) {
  console.log("starting request")
  res.sendFile(path.join(__dirname + '/index.html'));
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
