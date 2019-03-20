var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs")

var server = app.listen(9000,"127.0.0.1", function(){
     console.log("Express server has started on port 9000")
});

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var router = require('./routes/main')(app, fs);

