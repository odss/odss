const __name__ = Symbol('odss.function.name');
export function functionName(fn) {
    if (!fn) {
        throw new Error('Empty function name.');
    }
    const type = typeof fn;
    if (type === 'function') {
        if (fn[__name__]) {
            return fn[__name__];
        }
        const namespace = extractNamespace(fn);
        let name = transformUnderline(extractName(fn));
        name = fn[__name__] = `${namespace}${name}`;
        return name;
    }
    if (type === 'string') {
        return transformUnderline(fn);
    }
    throw new Error('Incorrect type. Expected: String or Function.');
}

export function functionNames(names) {
    if (!Array.isArray(names)) {
        names = [names];
    }
    const buff = [];
    for (let i = 0; i < names.length; i++) {
        buff.push(functionName(names[i]));
    }
    return buff;
}

function extractName(fn) {
    if (typeof fn.name === 'string') {
        return fn.name;
    }
    const match = /function\s+(.+?)\(/.exec(fn.toString());
    return (match ? match[1] : '');
}

function extractNamespace(fn) {
    const namespace = fn.NAMESPACE || fn.$namespace;
    const type = typeof namespace;
    return type !== 'undefined' ? `${namespace}.` : '';
}
/**
 * Transform name
 *
 * 'a_b_c_d' => 'a.b.c.d'
 * 'aBcD' => 'a.bc.d'
 *
 * @param {Stirng} name
 * @return {String}
 */
function transformUnderline(name) {
    return name.replace(/_/g, '.');
}
