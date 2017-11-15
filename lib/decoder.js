const codec = require('./codec');
const util = require('./util');

const Decoder = {};

let buffer;
let offset = 0;

function getBytes(flag) {
    const bytes = [];
    let pos = offset;
    flag = flag || false;

    let b;
    do {
        b = buffer.readUInt8(pos);
        bytes.push(b);
        pos++;
    } while (b >= 128);

    if (!flag) {
        offset = pos;
    }
    return bytes;
}

function peekBytes() {
    return getBytes(true);
}

/**
 * Get property head from protobuf
 */
function getHead() {
    const tag = codec.decodeUInt32(getBytes());

    return {
        type: tag & 0x7,  // eslint-disable-line
        tag: tag >> 3     // eslint-disable-line
    };
}

/**
 * Get tag head without move the offset
 */
function peekHead() {
    const tag = codec.decodeUInt32(peekBytes());

    return {
        type: tag & 0x7,   // eslint-disable-line
        tag: tag >> 3      // eslint-disable-line
    };
}


function decodeProp(type, protos) {
    let length;
    let ret;
    switch (type) {
    case 'uInt32':
        return codec.decodeUInt32(getBytes());
    case 'int32' :
    case 'sInt32' :
        return codec.decodeSInt32(getBytes());
    case 'float' :
        ret = buffer.readFloatLE(offset);
        offset += 4;
        return ret;
    case 'double' :
        ret = buffer.readDoubleLE(offset);
        offset += 8;
        return ret;
    case 'string' :
        length = codec.decodeUInt32(getBytes());
        ret = buffer.toString('utf8', offset, offset + length);
        offset += length;
        return ret;
    default : {
        const message = protos && (protos.__messages[type] || Decoder.protos[`message ${type}`]);
        if (message) {
            length = codec.decodeUInt32(getBytes());
            const msg = {};
                decodeMsg(msg, message, offset + length);  // eslint-disable-line
            return msg;
        }
        return null;
    }
    }
}

function decodeArray(array, type, protos) {
    if (util.isSimpleType(type)) {
        const length = codec.decodeUInt32(getBytes());

        for (let i = 0; i < length; i++) {
            array.push(decodeProp(type));
        }
    } else {
        array.push(decodeProp(type, protos));
    }
}


function decodeMsg(msg, protos, length) {
    while (offset < length) {
        const head = getHead();
        const tag = head.tag;
        const name = protos.__tags[tag];

        switch (protos[name].option) {
        case 'optional' :
        case 'required' :
            msg[name] = decodeProp(protos[name].type, protos);
            break;
        case 'repeated' :
            if (!msg[name]) {
                msg[name] = [];
            }
            decodeArray(msg[name], protos[name].type, protos);
            break;
        default:
            break;
        }
    }

    return msg;
}


Decoder.init = (protos) => {
    this.protos = protos || {};
};

Decoder.setProtos = (protos) => {
    if (protos) {
        this.protos = protos;
    }
};

Decoder.decode = (route, buf) => {
    const protos = this.protos[route];

    buffer = buf;
    offset = 0;

    if (protos) {
        return decodeMsg({}, protos, buffer.length);
    }

    return null;
};


/**
 * Test if the given msg is finished
 */
function isFinish(msg, protos) {
    return (!protos.__tags[peekHead().tag]);
}


module.exports = Decoder;
