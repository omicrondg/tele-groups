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
// &redirect_uri=https://tele-groups.herokuapp.com/feed
// &scope=groups_access_member_info
// &grant_type=client_credentials

// https://graph.facebook.com/oauth/access_token?client_id=213931083328336&client_secret=c023d0e85ffda9db25527669815c01d7&redirect_uri=https://tele-groups.herokuapp.com/feed&scope=groups_access_member_info,public_profile&grant_type=client_credentials
//https://www.facebook.com/v6.0/dialog/oauth?response_type=token&display=popup&client_id=213931083328336&redirect_uri=https%3A%2F%2Fdevelopers.facebook.com%2Ftools%2Fexplorer%2Fcallback&scope=manage_pages
// https://www.facebook.com/v6.0/dialog/oauth?response_type=token&display=popup&client_id=213931083328336&redirect_uri=https%3A%2F%2Fdevelopers.facebook.com%2Ftools%2Fexplorer%2Fcallback%3Fmethod%3DGET%26path%3D2784354238274641%252Ffeed%26version%3Dv6.0&auth_type=rerequest&scope=groups_access_member_info%2Cpublic_profile
var accessToken = 'access_token=213931083328336|c023d0e85ffda9db25527669815c01d7';
var token =
  process.env.TOKEN ||
  "EAADCkbY6a1ABAEsbWAohLFwWQhp56AfQyPckgtO4ty0ekGnUKTReddOIvQIdqkZAPZCZA2mtzsDKT4zWtZBfPwiImqrl1v0SKYwmYpVcFaVvhKm5XsL4NjzC5tYo0zGvYaJ0TMOP4OwTLBFA3KlvbWHGysAnL79cIaMyQAxXxwZDZD";
var groupId = '2784354238274641';
var received = [];

/* Server is alive request */
app.get('/', (req, res) => res.send("Hello world!"));

app.get("/feed", function (req, res) {
    console.log(req);
    let query = `${BASE_URL}/${groupId}/feed?${accessToken}`;

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
