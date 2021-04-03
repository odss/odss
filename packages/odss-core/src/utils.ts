import { OBJECTCLASS, OBJECTCLASS_NAME, getTokenTypes } from '@odss/common';
import { squery, IFilter } from '@odss/query';

/**
 * @param {String|Function|Filter} filter
 * @return Filter
 */
export function prepareFilter(name: any, filter = ''): IFilter {
    if (!name) {
        return squery(filter ? filter : '(*)');
    }
    const node = {
        [OBJECTCLASS]: name,
    };
    if (filter) {
        return squery([squery(node), squery(filter)]);
    }
    return squery(node);
}
