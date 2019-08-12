"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addSlashes(str) {
    return str.replace(/\\/g, '\\\\').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}
exports.addSlashes = addSlashes;
function escape(name) {
    const sb = [];
    if ((name.length > 0) && ((name.charAt(0) === ' ') || (name.charAt(0) === '#'))) {
        sb.push('\\');
    }
    for (let i = 0; i < name.length; i++) {
        const curChar = name.charAt(i);
        switch (curChar) {
            case '\\':
                sb.push('\\\\');
                break;
            case ',':
                sb.push('\\,');
                break;
            case '+':
                sb.push('\\+');
                break;
            case '"':
                sb.push('\\"');
                break;
            case '<':
                sb.push('\\<');
                break;
            case '>':
                sb.push('\\>');
                break;
            case ';':
                sb.push('\\;');
                break;
            default:
                sb.push(curChar);
        }
    }
    if ((name.length > 1) && (name.charAt(name.length - 1) === ' ')) {
        sb[sb.length - 1] = '\\ ';
    }
    return sb.join('');
}
exports.escape = escape;
