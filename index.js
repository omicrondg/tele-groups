const express = require('express');
const cors = require('cors');
const https = require('https');
const bodyParser = require('body-parser');
// const WebSocketServer = require('ws').Server;
// const WebSocketClient = require('ws');

const PORT = process.env.PORT || 5000;

const app = express();

var corsOptions = {
    // origin: 'https://yuliagurevich.github.io/',
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

/* Server is alive request */
app.get('/', (req, res) => res.send("Hello world!"));

app.listen(PORT);