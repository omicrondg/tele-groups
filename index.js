// const express = require('express');
// const cors = require('cors');
const https = require('https');
const bodyParser = require('body-parser');
const WebSocketServer = require('ws').Server;
const WebSocketClient = require('ws');

// const Devices = reqiure('./devices/devices.json');
const Devices = {
    "MY02": {
        "deviceId": "",
        "deviceName": "",
        "deviceCommandStreamId": "s5ded07ae9ddc524e6dce7b54",
        "deviceEnvironmentStreamId": "s5e53bf0a70d0d5858ccd48b6",
        "octaveUser": "alexeyp",
        "octaveCompany": "efcom",
        "octaveToken": "KYcrfTYKomioK2s5i5x7wxkOxRc8zpBQ"
    },
    "MY01": {
        "deviceId": "",
        "deviceName": "",
        "deviceCommandStreamId": "s5dcd2c41dabb34576e88cc35",
        "deviceEnvironmentStreamId": "",
        "octaveUser": "elkana_molson",
        "octaveCompany": "",
        "octaveToken": "MME1tIQKzPVBqUOCJCpLmgCSCE9cElGk"
    }
}

const OCTAVE_WS_SESSION_REQUEST_URL = 'https://octave-ws.sierrawireless.io/session';
const OCTAVE_WS_SESSION_URL = 'wss://octave-ws.sierrawireless.io/session';

// const PORT = process.env.PORT || 5000;

// const app = express();

var corsOptions = {
    // origin: 'https://yuliagurevich.github.io/',
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// app.use(cors(corsOptions));
// app.use(bodyParser.json());

const wss = new WebSocketServer({ port: 8181 });
console.log("Running");

// On dashboard-server WS connection
wss.on('connection', (ws) => {
    console.log("Dashboard connected");

    ws.on('message', (message) => {
        console.log("Message: ", message);
        console.log("Trying to connect Octave");

        // Extract connection info
        const deviceCode = JSON.parse(message).body.deviceCode;
        const deviceParameters = Devices[deviceCode];

        console.log("Device parameters: ", deviceParameters);


        // Request connection from Octave
        const options = {
            method: 'POST',
            headers: {
                'X-Auth-User': deviceParameters.octaveUser,
                'X-Auth-Company': deviceParameters.octaveCompany,
                'X-Auth-Token': deviceParameters.octaveToken
            }
        };

        const handleOctaveResponse = res => {
            //console.log("Response from Octave: ", res);

            res.setEncoding('utf8');

            let octaveResponse = '';
            res.on('data', chunk => octaveResponse += chunk);

            res.on('end', () => {
                // On server-octave WS connecion
                const sessionId = JSON.parse(octaveResponse).body.id;
                const wsUrl = `${OCTAVE_WS_SESSION_URL}/${sessionId}/ws`;

                const wsc = new WebSocketClient(wsUrl);

                wsc.on('open', () => {
                    // Subscribe to octave streams
                    console.log("WS with Octave opened");

                    wsc.send(JSON.stringify({
                        "msgId": "my_request",
                        "object": "event",
                        "type": "subscribe",
                        "streamId": deviceParameters.deviceEnvironmentStream,
                    }));

                });

                wsc.on('message', (message) => {
                    // Transfer the message from Octave to Dashboard
                    console.log("Message from Octave: ", message);
                    
                    ws.send(message);
                });

            });
        };

        const request = https.request(OCTAVE_WS_SESSION_REQUEST_URL, options, handleOctaveResponse);
        request.end();
    });



});

/* Server is alive request */
// app.get('/', (req, res) => res.send("Hello world!"));

/* Enable resource request */
/* app.post('/enable-resource', (req, res) => {
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
}); */
