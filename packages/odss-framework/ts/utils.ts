import squery from 'odss-query';

import {OBJECTCLASS} from 'odss-common';

let __name__ = Symbol('odss.function.name');


export function functionName(fn: Function) {
    if (!fn) {
        throw new Error('Empty function name.');
    }
    let type = typeof fn;
    if (type === 'function') {
        if (fn[__name__]) {
            return fn[__name__];
        }
        let name = transformUnderline(extractName(fn));
        let namespace = extractNamespace(fn);
        name = fn[__name__] = `${namespace}${name}`;
        return name;
    }
    if (type === 'string') {
        return transformUnderline(fn);
    }
    throw new Error('Incorrect type. Expected: String or Function.');
}
type ArrayString = string|string[];

export function functionNames(names): string[] {
    if (!Array.isArray(names)) {
        names = [names];
    }
    let buff = [];
    for (let i = 0; i < names.length; i++) {
        buff.push(functionName(names[i]));
    }
    return buff;
}

/**
 * @param {String|Function|Filter} filter
 * @return Filter
 */
export function prepareFilter(filter) {
    if (typeof filter === 'string') {
        filter = filter.trim();
        if (filter !== '*' && filter.charAt(0) !== '(' && filter.charAt(filter.length - 1) !== ')') {
            return squery({
                [OBJECTCLASS]: filter
            });
        }
        return squery(filter);
    }
    if (typeof filter === 'function' || Array.isArray(filter)) {
        return squery({
            [OBJECTCLASS]: functionNames(filter)
        });
    }
    return squery(filter);
}



export function defReadOnly(obj, name, value) {
    Object.defineProperty(obj, name, {
        value: value,
        enumerable: true
    });
}

function extractName(fn){
    if (typeof fn.name === 'string') {
        return fn.name;
    }
    let match = /function\s+(.+?)\(/.exec(fn.toString());
    return (match ? match[1] : '');
}

function extractNamespace(fn){
    let type = typeof fn.$namespace;
    return type !== 'undefined' ? `${fn.$namespace}.` : '';
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