import * as consts from './consts';
import { QueryType, QueryObject } from './types';
export { escape } from './utils';
import { parseString, prepareObject } from './parser';
import { IFilter, Filter, AndFilter } from './filters';

export { IFilter };

export function squery(query: QueryType): IFilter {
    let filter;
    if (Array.isArray(query)) {
        filter = new AndFilter(query);
    } else {
        if (Filter.isFilter(query)) {
            filter = query;
        } else if (typeof query === 'string') {
            filter = parseString(query);
        } else if (typeof query === 'object') {
            filter = prepareObject(query as QueryObject);
        }
    }
    if (!filter) {
        throw new TypeError('Unknown query type.');
    }
    return normalizeFilter(filter);
}

function normalizeFilter(filter): IFilter {
    if (filter.opt === consts.AND || filter.opt === consts.OR) {
        if (Array.isArray(filter.filters) && filter.filters.length === 1) {
            return normalizeFilter(filter.filters[0]);
        }
    }
    return filter;
}
