
const __name__ = Symbol('odss.function.name');

export function getTokenType(fn) {
    if (!fn) {
        throw new Error('Empty function name.');
    }
    const type = typeof fn;
    if (type === 'string') {
        return transformUnderline(fn);
    }
    if (type === 'function') {
        if (fn[__name__]) {
            return fn[__name__];
        }
        const namespace = extractNamespace(fn);
        let name = transformUnderline(extractName(fn));
        name = fn[__name__] = `${namespace}${name}`;
        return name;
    }
    if (type === 'number') {
        return (name as number).toString();
    }
    throw new Error('Incorrect type. Expected: String or Function or Number.');
}

export function getTokenTypes(names) {
    if (!Array.isArray(names)) {
        names = [names];
    }
    return names.map(getTokenType);
}

function extractName(fn) {
    if (typeof fn.name === 'string') {
        return fn.name;
    }
    const match = /function\s+(.+?)\(/.exec(fn.toString());
    return (match ? match[1] : '');
}

function extractNamespace(fn) {
    const namespace = fn.NAMESPACE || fn.$namespace || '';
    return namespace ? `${namespace}.` : '';
}

/**
 * Transform name
 *
 * 'a_b_c_d' => 'a.b.c.d'
 *
 * @param {Stirng} name
 * @return {String}
 */
function transformUnderline(name) {
    return name.replace(/_/g, '.');
}
