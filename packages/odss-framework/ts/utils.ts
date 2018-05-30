import squery from 'sjs-query';
import {OBJECTCLASS, functionNames} from 'odss-common';

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