const express = require('express');
const cors = require('cors');
const https = require('https');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

import Devices from './devices/devices.json';

const OCTAVE_WS_SESSION_REQUEST_URL = 'https://octave-ws.sierrawireless.io/session';
const OCTAVE_WS_SESSION_URL = 'wss://octave-ws.sierrawireless.io/session';

const PORT = process.env.PORT || 5000;

const app = express();

var corsOptions = {
    // origin: 'https://yuliagurevich.github.io/',
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

const wss = new ws.Server({ port: 8181 });

// On dashboard-server WS connection
wss.on('connection', (ws, req) => {
    // Extract connection info
    const deviceId = req.body.deviceId;
    const deviceParameters = Devices[deviceId];

    // Request connection to Octave
    const options = {
        method: 'POST',
        headers: {
            'X-Auth-User': deviceParameters.octaveUser,
            'X-Auth-Company': deviceParameters.octaveCompany,
            'X-Auth-Token': deviceParameters.octaveToken
        }
    };

    const handleOctaveResponse = res => {
        res.setEncoding('utf8');

        let octaveResponse = '';
        res.on('data', chunk => octaveResponse += chunk);

        res.on('end', () => {
            // On server-octave WS connecion
            const sessionId = JSON.parse(octaveResponse).body.id;
            const wsUrl = `${OCTAVE_WS_SESSION_URL}/${sessionId}/ws`;

            const wsc = new WebSocket(wsUrl);
            wss.send("Attempt to connect");

            wsc.on('open', () => {
                // Subscribe to octave streams
                wsc.send(JSON.stringify({
                    "msgId": "my_request",
                    "object": "event",
                    "type": "subscribe",
                    "streamId": deviceParameters.deviceEnvironmentStream,
                }));

            });

            wsc.on('message', (message) => {
                // Transfer the message from Octave to Dashboard
                wss.send(message);
            });
        });        
    };

    const request = https.request(OCTAVE_WS_SESSION_REQUEST_URL, options, handleOctaveResponse);
    request.end();

    // Send request to Octave
    wss.on('message', () => {

    });
});

/* Server is alive request */
app.get('/', (req, res) => res.send("Hello world!"));

/* Enable resource request */
app.post('/enable-resource', (req, res) => {
    const deviceId = req.body.deviceId;
    const deviceParameters = Devices[deviceId];
    const resourceName = req.body.resourceName;

    let data = null;

    switch (resourceName) {
        case "buzzer":
            data = { "elems": { "buzzer": { "enable": state } } };
            break;
        case "blue led":
            data = { "elems": { "leds": { "tri": { "blue": { "enable": state } } } } };
            break;
        default: ;
    };

    try {
        // const commandStreamId = 's5dcd2c41dabb34576e88cc35'; // Tel-Aviv
        // const commandStreamId = 's5ded07ae9ddc524e6dce7b54'; // Local

        const options = {
            method: 'POST',
            headers: {
                'X-Auth-User': deviceParameters.octaveUser,
                'X-Auth-Token': deviceParameters.octaveToken,
            }
        };

        // Set up the request
        var request = https.request(`https://octave-api.sierrawireless.io/v5.0/efcom/event/${d}`, options, function (res) {
            // res.setEncoding('utf8');
            res.on('data', function (data) {
                res.on('error', function (e) {

                });

                // post the data
                request.write(JSON.stringify(data));
                request.end();
            });
        });
    } catch (err) {
        res.send("Well... first step went well...");
    }
});
