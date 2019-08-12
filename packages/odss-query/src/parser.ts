import * as consts from './consts';
import {Filter} from './filters';

export default function parse(query) {
    let filter;
    if (Array.isArray(query)) {
        filter = prepareArray(query);
    } else {
        if (query instanceof Filter) {
            filter = query;
        } else if (typeof query === 'string') {
            filter = parseString(query);
        } else if (typeof query === 'object') {
            filter = prepareObject(query);
        }
    }
    if (!filter) {
        throw new TypeError('Incorrect query type.');
    }
    if (filter.opt === consts.AND || filter.opt === consts.OR) {
        if (Array.isArray(filter.value) && filter.value.length === 1) {
            filter = filter.value[0];
        }
    }
    return filter;
}

function prepareArray(query) {
    return new Filter(consts.AND, query);
}

function prepareObject(query) {
    const filter = new Filter(consts.AND, []);
    for (const name of Object.keys(query)) {
        const values = query[name];
        if (Array.isArray(values)) {
            const subfilter = new Filter(consts.OR, []);
            for (let v = 0; v < values.length; v += 1) {
                subfilter.value.push(new Filter(consts.EQ, values[v], name));
            }
            if (subfilter.value.length === 1) {
                filter.value.push(subfilter.value[0]);
            } else {
                filter.value.push(subfilter);
            }
        } else {
            filter.value.push(new Filter(consts.EQ, values, name));
        }
    }
    return filter;
}

function parseString(query) {
    query = query.trim();
    if (!query) {
        throw new TypeError('Empty query.');
    }
    if (query.charAt(0) !== '(' || query.charAt(query.length - 1) !== ')') {
        query = `(${query})`;
    }
    if (query.charAt(0) !== '(') {
        throw new TypeError('Miss startring: (');
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

    let sf: any = null;

    let isEscaped = false;
    const stack: Array<Filter | number> = [];
    while (++pos < len) {

        if (isEscaped) {
            isEscaped = false;
            continue;
        }

        if (query.charAt(pos) === '(') {
            skipWhitespace();
            switch (query.charAt(pos + 1)) {
                case '&':
                    stack.push(new Filter(consts.AND, []));
                    break;
                case '|':
                    stack.push(new Filter(consts.OR, []));
                    break;
                case '!':
                    stack.push(new Filter(consts.NOT, []));
                    break;
                default:
                    stack.push(pos + 1);
            }
        } else if (query.charAt(pos) === ')') {
            const top = stack.pop() || null;
            const head = stack[stack.length - 1];
            if (top instanceof Filter) {
                if (head instanceof Filter) {
                    head.value.push(top);
                } else {
                    sf = top;
                }
            } else if (head instanceof Filter) {
                head.value.push(subquery(query, top, pos - 1));
            } else {
                sf = subquery(query, top, pos - 1);
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

function subquery(query, start, end) {
    const checkEqual = (pos) => {
        if (query.charAt(pos) !== '=') {
            throw new Error('Expected <= in query: ' + sub);
        }
    };
    const sub = query.substring(start, end + 1);
    if (sub === '*') {
        return new Filter(consts.MATCH_ALL);
    }
    if (!sub) {
        throw new Error('Empty query');
    }
    if (!/[~$^<>=*]/.test(query)) {
        return new Filter(consts.PRESENT, '*', sub);
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
    let value = query.substring(start, end + 1);
    if (opt === consts.EQ) {
        if (value === '*') {
            opt = consts.PRESENT;
        } else if (value.indexOf('*') !== -1) {
            opt = consts.SUBSTRING;
            value = new RegExp('^' + value.split('*').join('.*?') + '$');
        }
    }
    return new Filter(opt, value, name);
}
