const express = require('express');
const cors = require('cors');
const https = require('https');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();

var corsOptions = {
    // origin: 'https://yuliagurevich.github.io/',
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.use(bodyParser.json());


function establishOctaveWsConnection() {
    // Request session
    console.log("Start POST request to Octave");

    const URL = 'https://octave-ws.sierrawireless.io/session';

    const options = {
        method: 'POST',
        headers: {
            'X-Auth-User': 'alexeyp',
            'X-Auth-Company': 'efcom',
            'X-Auth-Token': 'KYcrfTYKomioK2s5i5x7wxkOxRc8zpBQ',
        }
    }

    const handleResponse = (res) => {
        let octaveResponse = '';

        res.setEncoding('utf8');

        res.on('data', chunk => octaveResponse += chunk);

        res.on('end', () => {
            // Establish connection
            console.log(octaveResponse);

            const sessionId = JSON.parse(octaveResponse).body.id;
            wsUrl = `wss://octave-ws.sierrawireless.io/session/${sessionId}/ws`;

            const wsc = new WebSocket(wsUrl);

            wsc.on('open', () => {
                console.log("Octave WebSocket opened");
                wsc.send(JSON.stringify({
                    "msgId": "my_request",
                    "object": "event",
                    "type": "subscribe",
                    "streamId": "s5e53bf0a70d0d5858ccd48b6"
                }));
            });

            wsc.on('message', (message) => console.log(message));
        });
        res.on('error', e => console.log("Error from Octave"));
    }

    const request = https.request(URL, options, handleResponse);

    request.end();
}

/* Server is alive request */
app.get('/', (req, res) => res.send("Hello world!"));

/* Enable resource request */
app.post('/enable-resource', (req, res) => {
    console.log(">>>> Req body object", req.body);
    const state = req.body.state;
    const resource = req.body.resource;

    let data = null;

    switch (resource) {
        case "buzzer":
            data = {
                "elems": {
                    "buzzer": {
                        "enable": state
                    }
                }
            };
            break;
        case "blue led":
            data = {
                "elems": {
                    "leds": {
                        "tri": {
                            "blue": {
                                "enable": state
                            }
                        }
                    }
                }
            };
            break;
        default: ;
    };

    try {
        // const commandStreamId = 's5dcd2c41dabb34576e88cc35'; // Tel-Aviv
        // const commandStreamId = 's5ded07ae9ddc524e6dce7b54'; // Local

        const options = {
            //host: 'https://octave-api.sierrawireless.io/v5.0/efcom/event/s5ded07ae9ddc524e6dce7b54',
            //port: 443,
            //path: '/efcom/event/' + commandStreamId,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': 'KYcrfTYKomioK2s5i5x7wxkOxRc8zpBQ',
                'X-Auth-User': 'alexeyp',
                //'X-Auth-Token': 'MME1tIQKzPVBqUOCJCpLmgCSCE9cElGk',
                //'X-Auth-User': 'elkana_molson',
                //'cache-control': 'no-cache',
                //'Content-Length': Buffer.byteLength(JSON.stringify(body))
            }
        };

        // Set up the request
        var request = https.request('https://octave-api.sierrawireless.io/v5.0/efcom/event/s5ded07ae9ddc524e6dce7b54', options, function (res) {
            // res.setEncoding('utf8');
            res.on('data', function (data) {
                // console.log('Response:___ ' + data);
            });
            res.on('error', function (e) {
                // console.log("Got error: " + e.message);
            });

        });

        // post the data
        request.write(JSON.stringify(data));
        request.end();
    } catch (err) {
        console.log(err);
    }

    res.send("Well... first step went well...");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

establishOctaveWsConnection();