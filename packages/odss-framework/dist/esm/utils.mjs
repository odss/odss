import { OBJECTCLASS, getTokenTypes } from '@odss/common';
import squery from '@odss/query';
const __name__ = Symbol('odss.function.name');
/**
 * @param {String|Function|Filter} filter
 * @return Filter
 */
export function prepareFilter(name, filter = '') {
    if (!name) {
        return squery(filter ? filter : '(*)');
    }
    name = typeof name === 'string' ? name.trim() : getTokenTypes(name);
    let node = {
        [OBJECTCLASS]: name
    };
    if (filter) {
        return squery([
            squery(node),
            squery(filter)
        ]);
    }
    return squery(node);
}
