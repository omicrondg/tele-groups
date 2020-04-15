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

//to get new token:
// https://graph.facebook.com/oauth/access_token?
// client_id=213931083328336
// &client_secret=c023d0e85ffda9db25527669815c01d7
// &redirect_uri=http://example.com/
// &scope=<comma-separated-list-of-permissions>
// &grant_type=client_credentials



var token =
  process.env.TOKEN ||
  "EAADCkbY6a1ABAIvmIaCV7jYnkMcObt2YjWUa3ig16tZBVJIb5e0e4z3eFmqov2ekQwGb6U2OGyqS1VtzAWZCEOzuNZBh90ALkhNsQjbv13eIqNG6OcilApYldGMak2qr4ZCV0vuTQWqjkvkZBz95ckwsFs5JT7RR3MQzUkskJvta8AIWsXW9h6M2JjHrZBia4HQCXc1bk9B4hZApZCBWvfWLdRirkgNTi3JFjlik0gQ6xQZDZD";
var groupId = '2784354238274641';
var received = [];

/* Server is alive request */
app.get('/', (req, res) => res.send("Hello world!"));

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
