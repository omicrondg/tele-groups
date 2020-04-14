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
  "EAADCkbY6a1ABAH4XgDQBOLODtxEs75DSktMlskRXrtY7m04zTDWhqPojZC2NtZCCoSHPF23SfxBOrYWNJHUV5pqq94qR7eLvHPgbzCXfMJXY0hhCNotp6QqIV4ZCEyyKaB9k3CYLYbZCitF5qEQitLm018jOM3DKHBgQf6UGui4qs9a2gaiAf01ArvTZCmIkZD";
var groupId = '2784354238274641';
var received_updates = [];

/* Server is alive request */
// app.get('/', (req, res) => res.send("Hello world!"));
app.get("/", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

app.get("/feed", function (req, res) {
    console.log(req);
    let query = `${BASE_URL}/${groupId}/feed?access_token=${token}`;

    const request = https.get(query);
    request.end();
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

app.listen(PORT);
