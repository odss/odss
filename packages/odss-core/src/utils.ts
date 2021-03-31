import { OBJECTCLASS, getTokenTypes } from '@odss/common';
import { squery } from '@odss/query';

/**
 * @param {String|Function|Filter} filter
 * @return Filter
 */
export function prepareFilter(name: any, filter = '') {
    if (!name) {
        return squery(filter ? filter : '(*)');
    }

    name = typeof name === 'string' ? name.trim() : getTokenTypes(name);
    const node = {
        [OBJECTCLASS]: name,
    };
    if (filter) {
        return squery([squery(node), squery(filter)]);
    }
    return squery(node);
}