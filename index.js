const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();

var corsOptions = {
    origin: 'https://yuliagurevich.github.io/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));

app.get('/', (req, res) => res.send("Hello world!"));

app.post('/enable-led', (req, res) => {
    var io = req.body.ledState;
    const data = {
        "elems": {
            "leds": {
                "tri": {
                    "blue": {
                        "enable": io
                    }
                }
            }
        }
    }

    const commandStreamId = 's5ded07ae9ddc524e6dce7b54';

    const options = {
        hostname: 'octave-api.sierrawireless.io/v5.0',
        port: 443,
        path: '/telad_electronics/event/' + commandStreamId,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': 'MME1tIQKzPVBqUOCJCpLmgCSCE9cElGk',
            'X-Auth-User': 'elkana_molson',
            //'cache-control': 'no-cache',
            //'Content-Length': Buffer.byteLength(JSON.stringify(body))
        }
    };

    // Set up the request
    var request = https.request(options, function (res) {
        res.setEncoding('utf8');
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

    res.send("Got ya!");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

(event, context, callback) => {

    const requestBody = JSON.parse(event.body);

    var io = requestBody.led;
    console.log(io);
    const body = {
        "elems": {
            "leds": {
                "tri": {
                    "blue": {
                        "enable": true
                    }
                }
            }
        }
    }

    const data = {
        host: 'octave-api.sierrawireless.io',
        path: '/v5.0/telad_electronics/device/d5dcd2c41dabb34576e88cc2a',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': 'MME1tIQKzPVBqUOCJCpLmgCSCE9cElGk',
            'X-Auth-User': 'elkana_molson',
            'cache-control': 'no-cache',
            'Content-Length': Buffer.byteLength(JSON.stringify(body))
        }
    };


    // Set up the request
    var request = https.request(data, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            console.log('Response:___ ' + data);

            callback(null, {
                statusCode: 201,
                body: data,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            });

            // context.succeed();
        });
        res.on('error', function (e) {
            console.log("Got error: " + e.message);
            context.done(null, 'FAILURE');
        });

    });

    // post the data
    request.write(JSON.stringify(body));
    request.end();

};