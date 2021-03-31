import { IDisposable } from './types/core';

const __name__ = Symbol('odss.function.name');

type Func = () => void | { name: string };
type TokenType = Func | string | number;

export function getTokenType(token: TokenType): string {
    if (!token) {
        throw new Error('Empty function name.');
    }
    const type = typeof token;
    if (type === 'string') {
        return transformUnderline(token);
    }
    if (type === 'function') {
        if (token[__name__]) {
            return token[__name__];
        }
        const namespace = extractNamespace(token);
        let name = transformUnderline(extractName(token));
        name = token[__name__] = `${namespace}${name}`;
        return name;
    }
    if (type === 'number') {
        return token.toString();
    }
    throw new Error('Incorrect type. Expected: String or Function or Number.');
}

export function getTokenTypes(names: TokenType | TokenType[]): string[] {
    if (!Array.isArray(names)) {
        names = [names];
    }
    return names.map(getTokenType);
}

function extractName(fn: TokenType): string {
    if (typeof fn['name'] === 'string') {
        return fn['name'];
    }
    const match = /function\s+(.+?)\(/.exec(fn.toString());
    return match ? match[1] : '';
}

function extractNamespace(fn: TokenType): string {
    const namespace = fn['NAMESPACE'] || fn['$namespace'] || '';
    return namespace ? `${namespace}.` : '';
}

/**
 * Transform name
 *
 * 'a_b_c_d' => 'a.b.c.d'
 *
 * @param {Stirng} name
 * @return {String}
 */
function transformUnderline(name) {
    return name.replace(/_/g, '.');
}

export function toDisposable(dispose: IDisposable | (() => void) | undefined): IDisposable {
    if (typeof dispose === 'undefined') {
        return {
            dispose() {
                // do nothing.
            },
        };
    }
    if (typeof dispose === 'function') {
        return {
            dispose() {
                dispose();
            },
        };
    }
    return dispose;
}
