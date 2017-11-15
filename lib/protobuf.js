const encoder = require('./encoder');
const decoder = require('./decoder');
const parser = require('./parser');

const Protobuf = module.exports;

/**
 * [encode the given message, return a Buffer represent the message encoded by protobuf]
 * @param  {[type]} key The key to identify the message type.
 * @param  {[type]} msg The message body, a js object.
 * @return {[type]} The binary encode result in a Buffer.
 */
Protobuf.encode = (key, msg) => encoder.encode(key, msg);

Protobuf.encode2Bytes = (key, msg) => {
    const buffer = this.encode(key, msg);
    if (!buffer || !buffer.length) {
        console.warn('encode msg failed! key : %j, msg : %j', key, msg);
        return null;
    }
    const bytes = new Uint8Array(buffer.length);
    for (let offset = 0; offset < buffer.length; offset++) {
        bytes[offset] = buffer.readUInt8(offset);
    }

    return bytes;
};

Protobuf.encodeStr = (key, msg, code) => {
    code = code || 'base64';
    const buffer = Protobuf.encode(key, msg);
    return buffer ? buffer.toString(code) : buffer;
};

Protobuf.decode = (key, msg) => decoder.decode(key, msg);

Protobuf.decodeStr = (key, str, code) => {
    code = code || 'base64';
    const buffer = new Buffer(str, code);

    return buffer ? Protobuf.decode(key, buffer) : buffer;
};

Protobuf.parse = json => parser.parse(json);

Protobuf.setEncoderProtos = (protos) => {
    encoder.init(protos);
};

Protobuf.setDecoderProtos = (protos) => {
    decoder.init(protos);
};

Protobuf.init = (opts) => {
    // On the serverside, use serverProtos to encode messages send to client
    encoder.init(opts.encoderProtos);

    // On the serverside, user clientProtos to decode messages receive from clients
    decoder.init(opts.decoderProtos);
};
