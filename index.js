const express = require('express');
const https = require('https');

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send("Hello world!"));

app.listen(port, () => console.log("Listening"));


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
                    },
                    "red": {
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
        method: 'PUT',
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