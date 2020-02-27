const events = require("events");
const crypto = require("crypto");
const util = require("util");

const opcodes = {
    TEXT: 1,
    BINARY: 2,
    CLOSE: 8,
    PING: 9,
    PONG: 10
}

const webSocketConnection = function (req, socket, upgradeHead) {
    const self = this;

    const key = hashWebSocketKey(req.headers["sec-websocket-key"]);

    socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
        'Upgrade: WebSocket\r\n' +
        'Connection: Upgrade\r\n' +
        'sec-websocket-accept: ' + key +
        '\r\n\r\n');

    socket.on("data", function (buf) {
        self.buffer = Buffer.concat([self.buffer, buf]);
        while (self._processBuffer()) {
            // TODO
        }
    });

    socket.on("close", function (had_error) {
        if (!self.closed) {
            self.emit("close", 1006);
            self.closed = true;
        }
    });

    this.socket = socket;
    this.buffer = new Buffer(0);
    this.closed = false;
}

util.inherits(webSocketConnection, events.EventEmitter);

webSocketConnection.prototype.send = function (obj) {
    let = opcode;
    let = payload;
    if (Buffer.isBuffer(obj)) {
        opcode = opcodes.BINARY;
        payload = obj;
    } else if (typeof obj == "string") {
        opcode = opcodes.TEXT;
        payload = new Buffer(obj, "utf");
    } else {
        throw new Error("Cannot send object. Must be string or Buffer");
    }
    this._doSend(opcode, payload);
}

webSocketConnection.prototype.close = function (code, reason) {
    let opcode = opcodes.CLOSE;
    let buffer;

    if (code) {
        buffer = new Buffer(Buffer.byteLength(reason) + 2);
        buffer.writeUInt16BE(code, 0);
        buffer.write(reason, 2);
    } else {
        buffer = new Buffer(0);
    }

    this._doSend(opcode, buffer);
    this.closed = true;
}

webSocketConnection.prototype._processBuffer = function () {
    let buf = this.buffer;

    if (buf.length < 2) {
        // Insufficient data read
        return;
    }

    let idx = 2;

    let b1 = buf.readUInt8(0);
    let fin = b1 & 0x80;
    let opcode = b1 & 0x0f;  // low 4 bits
    let = b2 = buf.readUInt8(1);
    let mask = b2 & 0x80;
    let length = b2 & 0x7f; // low 7 bits

    if (length > 125) {
        if (buf.length < 8) {
            // Insufficient data read
            return;
        }
    }

    if (length === 126) {
        length = buf.readUInt16BE(2);
        idx += 2;
    } else if (length === 127) {
        // discard high 4 bits because this server cannot handle huge lengths
        const highBits = buf.readUInt32BE(2);
        if (highBits != 0) {
            this.close(1009, "");
        }
        length = buf.readUInt32BE(6);
        idx += 8;
    }

    if (buf.length < idx + 4 + length) {
        // Insufficient data read
        return;
    }

    maskBytes = buf.slice(idx, idx + 4); // don't understand
    idx += 4;
    let payload = buf.slice(idx, idx + length);
    payload = unmask(maskBytes, payload);
    this._handleFrame(opcode, payload);

    this.buffer = buf.slice(idx + length);
    return true;
}

webSocketConnection.prototype._handleFrame = function (opcode, buffer) {
    let payload;
    switch (opcode) {
        case opcodes.TEXT:
            payload = buffer.toString("utf8");
            this.emit("data", opcode, payload);
            break;
        case opcodes.BINARY:
            payload = buffer;
            this.emit("data", opcode, payload);
            break;
        case opcodes.PING:
            this._doSend(opcodes.PONG, buffer);
            break;
        case opcodes.PONG:
            break;
        case opcodes.CLOSE:
            let code;
            let reason;
            if (buffer.length >= 2) {
                code = buffer.readUInt16BE(0);
                reason = buffer.toString("utf8", 2);
            }
            this.close(code, reason);
            this.emit("close", code, reason);
            break;
        default:
            this.close(1002, "unknown code");
    }
}