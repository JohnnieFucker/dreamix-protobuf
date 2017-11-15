const Encoder = {};

/**
 * [encode an uInt32, return a array of bytes]
 * @param  {Number} num
 * @return {Array}
 */
Encoder.encodeUInt32 = (num) => {
    let n = parseInt(num); // eslint-disable-line
    if (isNaN(n) || n < 0) {
        console.log(n);
        return null;
    }

    const result = [];
    do {
        let tmp = n % 128;
        const next = Math.floor(n / 128);

        if (next !== 0) {
            tmp += 128;
        }
        result.push(tmp);
        n = next;
    } while (n !== 0);

    return result;
};

/**
 * [encode a sInt32, return a byte array]
 * @param  {[sInt32]} num  The sInt32 need to encode
 * @return {[Array]} A byte array represent the integer
 */
Encoder.encodeSInt32 = (num) => {
    let n = parseInt(num); // eslint-disable-line
    if (isNaN(n)) {
        return null;
    }
    n = n < 0 ? (Math.abs(n) * 2 - 1) : n * 2; // eslint-disable-line

    return Encoder.encodeUInt32(n);
};

Encoder.decodeUInt32 = (bytes) => {
    let n = 0;

    for (let i = 0; i < bytes.length; i++) {
        const m = parseInt(bytes[i]); // eslint-disable-line
        n += ((m & 0x7f) * Math.pow(2, (7 * i))); // eslint-disable-line
        if (m < 128) {
            return n;
        }
    }

    return n;
};


Encoder.decodeSInt32 = (bytes) => {
    let n = this.decodeUInt32(bytes);
    const flag = ((n % 2) === 1) ? -1 : 1;

    n = ((n % 2 + n) / 2) * flag;    // eslint-disable-line

    return n;
};

module.exports = Encoder;
