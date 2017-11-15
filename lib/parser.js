const Parser = module.exports;
/**
 * [parse a single protos, return a object represent the result. The method can be invocked recursively.]
 * @param  {[Object]} obj The origin proto need to parse.
 * @return {[Object]} The parsed result, a js object.
 */
function parseObject(obj) {
    const proto = {};
    const nestProtos = {};
    const tags = {};

    for (const name in obj) {
        if (obj.hasOwnProperty(name)) {
            const tag = obj[name];
            const params = name.split(' ');

            switch (params[0]) {
            case 'message':
                if (params.length === 2) {
                    nestProtos[params[1]] = parseObject(tag);
                }
                break;
            case 'required':
            case 'optional':
            case 'repeated': {
                // params length should be 3 and tag can't be duplicated
                if (params.length === 3 && !tags[tag]) {
                    proto[params[2]] = {
                        option: params[0],
                        type: params[1],
                        tag: tag
                    };
                    tags[tag] = params[2];
                }
                break;
            }
            default:
                break;
            }
        }
    }

    proto.__messages = nestProtos;
    proto.__tags = tags;
    return proto;
}


/**
 * [parse the original protos, give the paresed result can be used by protobuf encode/decode.]
 * @param  {[Object]} protos Original protos, in a js map.
 * @return {[Object]} The presed result, a js object represent all the meta data of the given protos.
 */
Parser.parse = (protos) => {
    const maps = {};
    for (const key in protos) {
        if (protos.hasOwnProperty(key)) {
            maps[key] = parseObject(protos[key]);
        }
    }

    return maps;
};

