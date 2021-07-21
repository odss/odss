
import * as consts from './consts';
import { IFilter, ICompositeFilter, QueryObject } from './types';
import {
    Filter,
    AndFilter,
    EqFilter,
    OrFilter,
    SubstringFilter,
    NotFilter,
    AllFilter,
    PresentFilter,
} from './filters';

export function prepareObject(query: QueryObject): IFilter {
    const filters: IFilter[] = [];
    for (const name of Object.keys(query)) {
        const values = query[name];
        if (Array.isArray(values)) {
            const subfilters: IFilter[] = [];
            for (let v = 0; v < values.length; v += 1) {
                subfilters.push(new EqFilter(name, values[v]));
            }
            const filter = subfilters.length === 1 ? subfilters[0] : new OrFilter(subfilters);
            filters.push(filter);
        } else {
            filters.push(new EqFilter(name, values as string));
        }
    }
    return filters.length === 1 ? filters[0] : new AndFilter(filters);
}

export function parseString(query: string): IFilter {
    query = query.trim();
    if (!query) {
        throw new TypeError('Empty query.');
    }
    if (query.charAt(0) !== '(' || query.charAt(query.length - 1) !== ')') {
        query = `(${query})`;
    }
    if (query.charAt(0) !== '(') {
        throw new TypeError('Miss starting: (');
    }
    if (query.charAt(query.length - 1) !== ')') {
        throw new TypeError('Miss ending: )');
    }

    let pos = -1;
    const len = query.length;

    function skipWhitespace() {
        while (pos < len) {
            if (!/\s/.test(query[pos])) {
                return pos;
            }
            pos++;
        }
        pos = -1;
    }

    let sf: IFilter | null = null;

    let isEscaped = false;
    const stack: Array<IFilter | number> = [];
    while (++pos < len) {
        if (isEscaped) {
            isEscaped = false;
            continue;
        }

        if (query.charAt(pos) === '(') {
            skipWhitespace();
            switch (query.charAt(pos + 1)) {
                case '&':
                    stack.push(new AndFilter());
                    break;
                case '|':
                    stack.push(new OrFilter());
                    break;
                case '!':
                    stack.push(new NotFilter());
                    break;
                default:
                    stack.push(pos + 1);
            }
        } else if (query.charAt(pos) === ')') {
            const top = stack.pop() || null;
            const head = stack[stack.length - 1];
            if (Filter.isFilter(top)) {
                if (Filter.isFilter(head)) {
                    (head as ICompositeFilter).filters.push(top as IFilter);
                } else {
                    sf = top as IFilter;
                }
            } else if (Filter.isFilter(head)) {
                (head as ICompositeFilter).filters.push(subquery(query, top as number, pos - 1));
            } else {
                sf = subquery(query, top as number, pos - 1);
            }
        } else if (!isEscaped && query.charAt(pos) === '\\') {
            isEscaped = true;
        }
    }
    if (sf === null) {
        throw new Error('Incorect query: ' + query);
    }
    return sf;
}

function subquery(query: string, start: number, end: number): IFilter {
    const checkEqual = pos => {
        if (query.charAt(pos) !== '=') {
            throw new Error('Expected <= in query: ' + sub);
        }
    };
    const sub = query.substring(start, end + 1);
    if (sub === '*') {
        return new AllFilter();
    }
    if (!sub) {
        throw new Error('Empty query.');
    }
    if (!/[~$^<>=*]/.test(query)) {
        return new PresentFilter(sub);
    }
    let opt = '';
    let endName = start;

    while (endName < end) {
        if ('=<>~'.indexOf(query.charAt(endName)) > -1) {
            break;
        }
        endName++;
    }
    if (start === endName) {
        throw new Error('Not found query name: ' + sub);
    }
    const name = query.substring(start, endName);
    start = endName;
    switch (query.charAt(start)) {
        case '=':
            opt = consts.EQ;
            ++start;
            break;
        case '<':
            checkEqual(start + 1);
            opt = consts.LTE;
            start += 2;
            break;
        case '>':
            checkEqual(start + 1);
            opt = consts.GTE;
            start += 2;
            break;
        case '~':
            checkEqual(start + 1);
            opt = consts.APPROX;
            start += 2;
            break;
        default:
            throw new Error('Unknowm query operator: ' + sub);
    }
    if (start > end) {
        throw new Error('Not found query value');
    }
    const value = query.substring(start, end + 1);
    if (opt === consts.EQ) {
        if (value === '*') {
            opt = consts.PRESENT;
        } else if (value.indexOf('*') !== -1) {
            const reg = new RegExp('^' + value.split('*').join('.*?') + '$');
            return new SubstringFilter(name, reg);
        }
    }
    return Filter.create(opt, name, value);
}
