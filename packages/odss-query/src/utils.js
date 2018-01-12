export function addSlashes(str) {
    return str.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}
export function escape(name) {
    let sb = [];
    if ((name.length > 0) && ((name.charAt(0) === ' ') || (name.charAt(0) === '#'))) {
        sb.push('\\');
    }
    for (let i = 0; i < name.length; i++) {
        let curChar = name.charAt(i);
        switch (curChar) {
            case '\\':
                sb.push("\\\\");
                break;
            case ',':
                sb.push("\\,");
                break;
            case '+':
                sb.push("\\+");
                break;
            case '"':
                sb.push("\\\"");
                break;
            case '<':
                sb.push("\\<");
                break;
            case '>':
                sb.push("\\>");
                break;
            case ';':
                sb.push("\\;");
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
