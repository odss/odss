import { Filter } from './filters';
import * as consts from './consts';
export function prepare(query) {
    let filter = new Filter(consts.AND, []);
    let names = Object.keys(query);
    for (let a = 0; a < names.length; a += 1) {
        let name = names[a];
        let values = query[name];
        if (Array.isArray(values)) {
            let subfilter = new Filter(consts.OR, []);
            for (let v = 0; v < values.length; v += 1) {
                subfilter.value.push(new Filter(consts.EQ, values[v], name));
            }
            if (subfilter.value.length === 1) {
                filter.value.push(subfilter.value[0]);
            }
            else {
                filter.value.push(subfilter);
            }
        }
        else {
            filter.value.push(new Filter(consts.EQ, values, name));
        }
    }
    if (filter.value.length === 1) {
        return filter.value[0];
    }
    return filter;
}
export function parse(query) {
    if (query instanceof Filter) {
        return query;
    }
    if (typeof query !== 'string') {
        throw new TypeError('Incorrect query type. String expected.');
    }
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
    let len = query.length;
    function skipWhitespace() {
        while (pos < len) {
            if (!/\s/.test(query[pos])) {
                return pos;
            }
            pos++;
        }
        pos = -1;
    }
    let sf = null;
    let isEscaped = false;
    let stack = [];
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
        }
        else if (query.charAt(pos) === ')') {
            let top = stack.pop() || null;
            let head = stack[stack.length - 1];
            if (top instanceof Filter) {
                if (head instanceof Filter) {
                    head.value.push(top);
                }
                else {
                    sf = top;
                }
            }
            else if (head instanceof Filter) {
                head.value.push(subquery(query, top, pos - 1));
            }
            else {
                sf = subquery(query, top, pos - 1);
            }
        }
        else if (!isEscaped && query.charAt(pos) === '\\') {
            isEscaped = true;
        }
    }
    if (sf === null) {
        throw new Error('Incorect query: ' + query);
    }
    return sf;
}
function subquery(query, start, end) {
    let checkEqual = pos => {
        if (query.charAt(pos) !== '=') {
            throw new Error('Expected <= in query: ' + sub);
        }
    };
    let sub = query.substring(start, end + 1);
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
    let name = query.substring(start, endName);
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
        }
        else if (value.indexOf('*') !== -1) {
            opt = consts.SUBSTRING;
            value = new RegExp('^' + value.split('*').join('.*?') + '$');
        }
    }
    return new Filter(opt, value, name);
}
