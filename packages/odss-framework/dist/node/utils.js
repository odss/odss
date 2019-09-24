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
    name = typeof name === 'string' ? name.trim() : common_1.getTokenTypes(name);
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
