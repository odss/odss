import { getTokenTypes, OBJECTCLASS } from '@odss/common';
import { squery, IFilter } from '@odss/query';

/**
 * @param {String|Function|Filter} filter
 * @return Filter
 */
export function prepareFilter(token: any, filter = ''): IFilter {
    if (!token) {
        return squery(filter ? filter : '(*)');
    }
    token = getTokenTypes(token);
    const node = {
        [OBJECTCLASS]: token,
    };
    if (filter) {
        return squery([squery(node), squery(filter)]);
    }
    return squery(node);
}
