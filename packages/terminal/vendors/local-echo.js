var t = {
        121: (t, e, s) => {
            s(151), (e.parse = s(38));
        },
        38: t => {
            for (
                var e =
                        '(?:' +
                        [
                            '\\|\\|',
                            '\\&\\&',
                            ';;',
                            '\\|\\&',
                            '\\<\\(',
                            '\\<\\<\\<',
                            '>>',
                            '>\\&',
                            '<\\&',
                            '[&;()|<>]',
                        ].join('|') +
                        ')',
                    s = '|&;()<> \\t',
                    r = '(\\\\[\'"' + s + ']|[^\\s\'"' + s + '])+',
                    i = '"((\\\\"|[^"])*?)"',
                    n = "'((\\\\'|[^'])*?)'",
                    h = '',
                    o = 0;
                o < 4;
                o++
            )
                h += (Math.pow(16, 8) * Math.random()).toString(16);
            t.exports = function (t, s, o) {
                var a = (function (t, s, o) {
                    var a = new RegExp(
                            ['(' + e + ')', '(' + r + '|' + i + '|' + n + ')*'].join('|'),
                            'g'
                        ),
                        l = t.match(a).filter(Boolean);
                    if (!l) return [];
                    s || (s = {}), o || (o = {});
                    var c = !1;
                    return l
                        .map(function (t, r) {
                            if (!c) {
                                if (RegExp('^' + e + '$').test(t)) return { op: t };
                                var i,
                                    n = o.escape || '\\',
                                    a = !1,
                                    u = !1,
                                    p = '',
                                    m = !1;
                                for (i = 0; i < t.length; i++) {
                                    var f = t.charAt(i);
                                    if (((m = m || (!a && ('*' === f || '?' === f))), u))
                                        (p += f), (u = !1);
                                    else if (a)
                                        f === a
                                            ? (a = !1)
                                            : "'" == a
                                            ? (p += f)
                                            : f === n
                                            ? ((i += 1),
                                              (p +=
                                                  '"' === (f = t.charAt(i)) || f === n || '$' === f
                                                      ? f
                                                      : n + f))
                                            : (p += '$' === f ? _() : f);
                                    else if ('"' === f || "'" === f) a = f;
                                    else {
                                        if (RegExp('^' + e + '$').test(f)) return { op: t };
                                        if (/^#$/.test(f))
                                            return (
                                                (c = !0),
                                                p.length
                                                    ? [
                                                          p,
                                                          {
                                                              comment:
                                                                  t.slice(i + 1) +
                                                                  l.slice(r + 1).join(' '),
                                                          },
                                                      ]
                                                    : [
                                                          {
                                                              comment:
                                                                  t.slice(i + 1) +
                                                                  l.slice(r + 1).join(' '),
                                                          },
                                                      ]
                                            );
                                        f === n ? (u = !0) : (p += '$' === f ? _() : f);
                                    }
                                }
                                return m ? { op: 'glob', pattern: p } : p;
                            }
                            function _() {
                                var e, r, n, o;
                                if (((i += 1), '{' === t.charAt(i))) {
                                    if (((i += 1), '}' === t.charAt(i)))
                                        throw new Error('Bad substitution: ' + t.substr(i - 2, 3));
                                    if ((e = t.indexOf('}', i)) < 0)
                                        throw new Error('Bad substitution: ' + t.substr(i));
                                    (r = t.substr(i, e - i)), (i = e);
                                } else /[*@#?$!_-]/.test(t.charAt(i)) ? ((r = t.charAt(i)), (i += 1)) : (e = t.substr(i).match(/[^\w\d_]/)) ? ((r = t.substr(i, e.index)), (i += e.index - 1)) : ((r = t.substr(i)), (i = t.length));
                                return (
                                    (n = r),
                                    void 0 === (o = 'function' == typeof s ? s(n) : s[n]) && '' != n
                                        ? (o = '')
                                        : void 0 === o && (o = '$'),
                                    'object' == typeof o ? '' + h + JSON.stringify(o) + h : '' + o
                                );
                            }
                        })
                        .reduce(function (t, e) {
                            return void 0 === e ? t : t.concat(e);
                        }, []);
                })(t, s, o);
                return 'function' != typeof s
                    ? a
                    : a.reduce(function (t, e) {
                          if ('object' == typeof e) return t.concat(e);
                          var s = e.split(RegExp('(' + h + '.*?' + h + ')', 'g'));
                          return 1 === s.length
                              ? t.concat(s[0])
                              : t.concat(
                                    s.filter(Boolean).map(function (t) {
                                        return RegExp('^' + h).test(t)
                                            ? JSON.parse(t.split(h)[1])
                                            : t;
                                    })
                                );
                      }, []);
            };
        },
        151: t => {
            t.exports = function (t) {
                return t
                    .map(function (t) {
                        return t && 'object' == typeof t
                            ? t.op.replace(/(.)/g, '\\$1')
                            : /["\s]/.test(t) && !/'/.test(t)
                            ? "'" + t.replace(/(['\\])/g, '\\$1') + "'"
                            : /["'\s]/.test(t)
                            ? '"' + t.replace(/(["\\$`!])/g, '\\$1') + '"'
                            : String(t).replace(
                                  /([A-Za-z]:)?([#!"$&'()*,:;<=>?@[\\\]^`{|}])/g,
                                  '$1\\$2'
                              );
                    })
                    .join(' ');
            };
        },
    },
    e = {};
function s(r) {
    var i = e[r];
    if (void 0 !== i) return i.exports;
    var n = (e[r] = { exports: {} });
    return t[r](n, n.exports, s), n.exports;
}
(s.d = (t, e) => {
    for (var r in e)
        s.o(e, r) && !s.o(t, r) && Object.defineProperty(t, r, { enumerable: !0, get: e[r] });
}),
    (s.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e));
var r = {};
(() => {
    s.d(r, { R: () => t, Z: () => p });
    class t {
        constructor(t) {
            (this.size = t), (this.entries = []), (this.cursor = 0);
        }
        push(t) {
            '' !== t.trim() &&
                t != this.entries[this.entries.length - 1] &&
                (this.entries.push(t),
                this.entries.length > this.size && this.entries.pop(0),
                (this.cursor = this.entries.length));
        }
        rewind() {
            this.cursor = this.entries.length;
        }
        getPrevious() {
            const t = Math.max(0, this.cursor - 1);
            return (this.cursor = t), this.entries[t];
        }
        getNext() {
            const t = Math.min(this.entries.length, this.cursor + 1);
            return (this.cursor = t), this.entries[t];
        }
    }
    var e = s(121);
    function i(t, e = !0) {
        let s;
        const r = [],
            i = /\w+/g;
        for (; (s = i.exec(t)); ) e ? r.push(s.index) : r.push(s.index + s[0].length);
        return r;
    }
    function n(t, e) {
        const s = i(t, !0)
            .reverse()
            .find(t => t < e);
        return null == s ? 0 : s;
    }
    function h(t, e, s) {
        let r = 0,
            i = 0;
        for (let n = 0; n < e; ++n)
            '\n' == t.charAt(n) ? ((i = 0), (r += 1)) : ((i += 1), i > s && ((i = 0), (r += 1)));
        return { row: r, col: i };
    }
    function o(t, e) {
        return h(t, t.length, e).row + 1;
    }
    function a(t) {
        return null != t.match(/[^\\][ \t]$/m);
    }
    function l(t) {
        return '' === t.trim() || a(t) ? '' : (0, e.parse)(t).pop() || '';
    }
    async function c(t, s) {
        const r = (0, e.parse)(s);
        let i = r.length - 1,
            n = r[i] || '';
        '' === s.trim() ? ((i = 0), (n = '')) : a(s) && ((i += 1), (n = ''));
        try {
            return (await t.reduce((t, { fn: e, args: s }) => t.concat(e(i, r, ...s)), [])).filter(
                t => t.startsWith(n)
            );
        } catch (t) {
            return console.error('Auto-complete error:', t), candidates;
        }
        return [];
    }
    function u(t, e) {
        if (t.length >= e[0].length) return t;
        const s = t;
        t += e[0].slice(t.length, t.length + 1);
        for (let r = 0; r < e.length; r++) {
            if (!e[r].startsWith(s)) return null;
            if (!e[r].startsWith(t)) return s;
        }
        return u(t, e);
    }
    const p = class {
        constructor(e = null, s = {}) {
            (this.term = e),
                (this._handleTermData = this.handleTermData.bind(this)),
                (this._handleTermResize = this.handleTermResize.bind(this)),
                (this.history = new t(s.historySize || 10)),
                (this.maxAutocompleteEntries = s.maxAutocompleteEntries || 100),
                (this._autocompleteHandlers = []),
                (this._active = !1),
                (this._input = ''),
                (this._cursor = 0),
                (this._activePrompt = null),
                (this._activeCharPrompt = null),
                (this._termSize = { cols: 0, rows: 0 }),
                (this._disposables = []),
                e && (e.loadAddon ? e.loadAddon(this) : this.attach());
        }
        activate(t) {
            (this.term = t), this.attach();
        }
        dispose() {
            this.detach();
        }
        detach() {
            this.term.off
                ? (this.term.off('data', this._handleTermData),
                  this.term.off('resize', this._handleTermResize))
                : (this._disposables.forEach(t => t.dispose()), (this._disposables = []));
        }
        attach() {
            this.term.on
                ? (this.term.on('data', this._handleTermData),
                  this.term.on('resize', this._handleTermResize))
                : (this._disposables.push(this.term.onData(this._handleTermData)),
                  this._disposables.push(this.term.onResize(this._handleTermResize))),
                (this._termSize = { cols: this.term.cols, rows: this.term.rows });
        }
        addAutocompleteHandler(t, ...e) {
            this._autocompleteHandlers.push({ fn: t, args: e });
        }
        removeAutocompleteHandler(t) {
            const e = this._autocompleteHandlers.findIndex(e => e.fn === t);
            -1 !== e && this._autocompleteHandlers.splice(e, 1);
        }
        read(t, e = '> ') {
            return new Promise((s, r) => {
                this.term.write(t),
                    (this._activePrompt = {
                        prompt: t,
                        continuationPrompt: e,
                        resolve: s,
                        reject: r,
                    }),
                    (this._input = ''),
                    (this._cursor = 0),
                    (this._active = !0);
            });
        }
        readChar(t) {
            return new Promise((e, s) => {
                this.term.write(t), (this._activeCharPrompt = { prompt: t, resolve: e, reject: s });
            });
        }
        abortRead(t = 'aborted') {
            (null == this._activePrompt && null == this._activeCharPrompt) ||
                this.term.write('\r\n'),
                null != this._activePrompt &&
                    (this._activePrompt.reject(t), (this._activePrompt = null)),
                null != this._activeCharPrompt &&
                    (this._activeCharPrompt.reject(t), (this._activeCharPrompt = null)),
                (this._active = !1);
        }
        println(t) {
            this.print(t + '\n');
        }
        print(t) {
            const e = t.replace(/[\r\n]+/g, '\n');
            this.term.write(e.replace(/\n/g, '\r\n'));
        }
        printWide(t, e = 2) {
            if (0 == t.length) return println('');
            const s = t.reduce((t, e) => Math.max(t, e.length), 0) + e,
                r = Math.floor(this._termSize.cols / s),
                i = Math.ceil(t.length / r);
            let n = 0;
            for (let e = 0; e < i; ++e) {
                let e = '';
                for (let i = 0; i < r; ++i)
                    if (n < t.length) {
                        let r = t[n++];
                        (r += ' '.repeat(s - r.length)), (e += r);
                    }
                this.println(e);
            }
        }
        applyPrompts(t) {
            const e = (this._activePrompt || {}).prompt || '',
                s = (this._activePrompt || {}).continuationPrompt || '';
            return e + t.replace(/\n/g, '\n' + s);
        }
        applyPromptOffset(t, e) {
            return this.applyPrompts(t.substr(0, e)).length;
        }
        clearInput() {
            const t = this.applyPrompts(this._input),
                e = o(t, this._termSize.cols),
                s = this.applyPromptOffset(this._input, this._cursor),
                { col: r, row: i } = h(t, s, this._termSize.cols),
                n = e - i - 1;
            for (var a = 0; a < n; ++a) this.term.write('[E');
            for (this.term.write('\r[K'), a = 1; a < e; ++a) this.term.write('[F[K');
        }
        setInput(t, e = !0) {
            e && this.clearInput();
            const s = this.applyPrompts(t);
            this.print(s), this._cursor > t.length && (this._cursor = t.length);
            const r = this.applyPromptOffset(t, this._cursor),
                i = o(s, this._termSize.cols),
                { col: n, row: a } = h(s, r, this._termSize.cols),
                l = i - a - 1;
            this.term.write('\r');
            for (var c = 0; c < l; ++c) this.term.write('[F');
            for (c = 0; c < n; ++c) this.term.write('[C');
            this._input = t;
        }
        printAndRestartPrompt(t) {
            const e = this._cursor;
            this.setCursor(this._input.length), this.term.write('\r\n');
            const s = () => {
                    (this._cursor = e), this.setInput(this._input);
                },
                r = t();
            null == r ? s() : r.then(s);
        }
        setCursor(t) {
            t < 0 && (t = 0), t > this._input.length && (t = this._input.length);
            const e = this.applyPrompts(this._input),
                s = (o(e, this._termSize.cols), this.applyPromptOffset(this._input, this._cursor)),
                { col: r, row: i } = h(e, s, this._termSize.cols),
                n = this.applyPromptOffset(this._input, t),
                { col: a, row: l } = h(e, n, this._termSize.cols);
            if (l > i) for (let t = i; t < l; ++t) this.term.write('[B');
            else for (let t = l; t < i; ++t) this.term.write('[A');
            if (a > r) for (let t = r; t < a; ++t) this.term.write('[C');
            else for (let t = a; t < r; ++t) this.term.write('[D');
            this._cursor = t;
        }
        handleCursorMove(t) {
            if (t > 0) {
                const e = Math.min(t, this._input.length - this._cursor);
                this.setCursor(this._cursor + e);
            } else if (t < 0) {
                const e = Math.max(t, -this._cursor);
                this.setCursor(this._cursor + e);
            }
        }
        handleCursorErase(t) {
            const { _cursor: e, _input: s } = this;
            if (t) {
                if (e <= 0) return;
                const t = s.substr(0, e - 1) + s.substr(e);
                this.clearInput(), (this._cursor -= 1), this.setInput(t, !1);
            } else {
                const t = s.substr(0, e) + s.substr(e + 1);
                this.setInput(t);
            }
        }
        handleCursorInsert(t) {
            const { _cursor: e, _input: s } = this,
                r = s.substr(0, e) + t + s.substr(e);
            (this._cursor += t.length), this.setInput(r);
        }
        handleReadComplete() {
            this.history && this.history.push(this._input),
                this._activePrompt &&
                    (this._activePrompt.resolve(this._input), (this._activePrompt = null)),
                this.term.write('\r\n'),
                (this._active = !1);
        }
        handleTermResize(t) {
            const { rows: e, cols: s } = t;
            this.clearInput(),
                (this._termSize = { cols: s, rows: e }),
                this.setInput(this._input, !1);
        }
        handleTermData(t) {
            if (this._active) {
                if (null != this._activeCharPrompt)
                    return (
                        this._activeCharPrompt.resolve(t),
                        (this._activeCharPrompt = null),
                        void this.term.write('\r\n')
                    );
                if (t.length > 3 && 27 !== t.charCodeAt(0)) {
                    const e = t.replace(/[\r\n]+/g, '\r');
                    Array.from(e).forEach(t => this.handleData(t));
                } else this.handleData(t);
            }
        }
        async handleData(t) {
            if (!this._active) return;
            const e = t.charCodeAt(0);
            let s;
            if (27 == e)
                switch (t.substr(1)) {
                    case '[A':
                        if (this.history) {
                            let t = this.history.getPrevious();
                            t && (this.setInput(t), this.setCursor(t.length));
                        }
                        break;
                    case '[B':
                        if (this.history) {
                            let t = this.history.getNext();
                            t || (t = ''), this.setInput(t), this.setCursor(t.length);
                        }
                        break;
                    case '[D':
                        this.handleCursorMove(-1);
                        break;
                    case '[C':
                        this.handleCursorMove(1);
                        break;
                    case '[3~':
                        this.handleCursorErase(!1);
                        break;
                    case '[F':
                        this.setCursor(this._input.length);
                        break;
                    case '[H':
                        this.setCursor(0);
                        break;
                    case 'b':
                        (s = n(this._input, this._cursor)), null != s && this.setCursor(s);
                        break;
                    case 'f':
                        (s = (function (t, e) {
                            const s = i(t, !1).find(t => t > e);
                            return null == s ? t.length : s;
                        })(this._input, this._cursor)),
                            null != s && this.setCursor(s);
                        break;
                    case '':
                        (s = n(this._input, this._cursor)),
                            null != s &&
                                (this.setInput(
                                    this._input.substr(0, s) + this._input.substr(this._cursor)
                                ),
                                this.setCursor(s));
                }
            else if (e < 32 || 127 === e)
                switch (t) {
                    case '\r':
                        '' != (r = this._input).trim() &&
                        ((r.match(/'/g) || []).length % 2 != 0 ||
                            (r.match(/"/g) || []).length % 2 != 0 ||
                            '' ==
                                r
                                    .split(/(\|\||\||&&)/g)
                                    .pop()
                                    .trim() ||
                            (r.endsWith('\\') && !r.endsWith('\\\\')))
                            ? this.handleCursorInsert('\n')
                            : this.handleReadComplete();
                        break;
                    case '':
                        this.handleCursorErase(!0);
                        break;
                    case '\t':
                        if (this._autocompleteHandlers.length > 0) {
                            const t = this._input.substr(0, this._cursor),
                                e = a(t),
                                s = await c(this._autocompleteHandlers, t);
                            if ((s.sort(), 0 === s.length)) e || this.handleCursorInsert(' ');
                            else if (1 === s.length) {
                                const e = l(t);
                                this.handleCursorInsert(s[0].substr(e.length) + ' ');
                            } else if (s.length <= this.maxAutocompleteEntries) {
                                const e = u(t, s);
                                if (e) {
                                    const s = l(t);
                                    this.handleCursorInsert(e.substr(s.length));
                                }
                                this.printAndRestartPrompt(() => {
                                    this.printWide(s);
                                });
                            } else
                                this.printAndRestartPrompt(() =>
                                    this.readChar(
                                        `Display all ${s.length} possibilities? (y or n)`
                                    ).then(t => {
                                        ('y' != t && 'Y' != t) || this.printWide(s);
                                    })
                                );
                        } else this.handleCursorInsert('    ');
                        break;
                    case '':
                        this.setCursor(this._input.length),
                            this.term.write('^C\r\n' + ((this._activePrompt || {}).prompt || '')),
                            (this._input = ''),
                            (this._cursor = 0),
                            this.history && this.history.rewind();
                }
            else this.handleCursorInsert(t);
            var r;
        }
    };
})();
var i = r.R,
    n = r.Z;
export { i as HistoryController, n as default };
//# sourceMappingURL=local-echo.js.map