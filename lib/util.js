const util = {};

util.isSimpleType = type => (type === 'uInt32' ||
    type === 'sInt32' ||
    type === 'int32' ||
    type === 'uInt64' ||
    type === 'sInt64' ||
    type === 'float' ||
    type === 'double');

util.equal = (obj0, obj1) => {
    for (const key in obj0) {
        if (obj0.hasOwnProperty(key)) {
            const m = obj0[key];
            const n = obj1[key];

            if (typeof (m) === 'object') {
                if (!util.equal(m, n)) {
                    return false;
                }
            } else if (m !== n) {
                return false;
            }
        }
    }

    return true;
};

module.exports = util;
