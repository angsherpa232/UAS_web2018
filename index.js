const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var app = express()

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(5000);


// express()
//   .use(express.static(path.join(__dirname, '/index.html')))
//   .set('views', path.join(__dirname, 'views'))
//   //.set('view engine', 'html')
//   .get('/', (req, res) => res.render('index.html'))
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`))
