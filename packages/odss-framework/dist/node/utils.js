"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@odss/common");
const query_1 = require("@odss/query");
const __name__ = Symbol('odss.function.name');
/**
 * @param {String|Function|Filter} filter
 * @return Filter
 */
function prepareFilter(name, filter = '') {
    if (!name) {
        return query_1.default(filter ? filter : '(*)');
    }
    name = typeof name === 'string' ? name.trim() : functionNames(name);
    let node = {
        [common_1.OBJECTCLASS]: name
    };
    if (filter) {
        return query_1.default([
            query_1.default(node),
            query_1.default(filter)
        ]);
    }
    return query_1.default(node);
}
exports.prepareFilter = prepareFilter;
function functionName(fn) {
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
    throw new Error('Incorrect type. Expected: String or Function.');
}
exports.functionName = functionName;
function functionNames(names) {
    if (!Array.isArray(names)) {
        names = [names];
    }
    const buff = [];
    for (let i = 0; i < names.length; i++) {
        buff.push(functionName(names[i]));
    }
    return buff;
}
exports.functionNames = functionNames;
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
