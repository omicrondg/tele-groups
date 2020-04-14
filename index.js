const express = require("express");
const bodyParser = require("body-parser");
var xhub = require("express-x-hub");
const cors = require("cors");
const https = require("https");
// const WebSocketServer = require('ws').Server;
// const WebSocketClient = require('ws');

const PORT = process.env.PORT || 5000;
const BASE_URL = 'https://graph.facebook.com/v6.0';
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(cors(corsOptions));
// app.use(xhub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token =
  process.env.TOKEN ||
  "EAADCkbY6a1ABALEIwUWMURQyI3uRKgfs1aUZBrnvRNmbMCMdKnuxLfl4ZCl55Xr606w2nWx27oogjS6GEK4ZAlgTH3TuJYODlnvngevwp4FY5C6PHPrrdx9IZA8oW8VbJfAxm4ExF5aco7S0eR7OLkWpsupyNp4vmHHtYGsuZBF7ymZAJQ72pzMfydik3slilytMpfCTB7BQZDZD";
var groupId = '2784354238274641';
var received = [];

/* Server is alive request */
// app.get('/', (req, res) => res.send("Hello world!"));
app.get("/", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

app.get("/feed", function (req, res) {
    console.log(req);
    let query = `${BASE_URL}/${groupId}/feed?access_token=${token}`;

    const request = https.get(query, printFeeds);
    request.end();
  res.send("<pre>" + JSON.stringify(received, null, 2) + "</pre>");
});


const printFeeds = res => {
    res.setEncoding('utf8');

    let back = '';

    res.on('data', chunk => back += chunk);
    res.on('end', () => {
        received = back;
    })

}

app.listen(PORT);
