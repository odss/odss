"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalService = void 0;
const local_echo_js_1 = require("../vendors/local-echo.js");
const xterm_js_1 = require("../vendors/xterm.js");
const ui_1 = require("./ui");
class TerminalService {
    shell;
    xterm;
    controller;
    ui = new ui_1.MainUI();
    toDispose = [];
    constructor() { }
    attach(shell) {
        this.shell = shell;
        this.ui.activate();
    }
    detach() {
        this.toggle(false);
        this.ui.deactivate();
        this.shell = null;
    }
    start() {
        this.ui.start();
        this.xterm = new xterm_js_1.Terminal({
            fontSize: '20px',
        });
        this.controller = new local_echo_js_1.default();
        this.xterm.loadAddon(this.controller);
        this.xterm.open(this.ui.getContainer());
        this.runCommandLoop();
        this.toDispose.push(this.controller.addAutocompleteHandler((index, tokens, args) => {
            return this.shell?.complete(tokens.join(' ')) || [];
        }));
        this.toDispose.push(this.ui.onToggle(status => this.toggle(status)));
        this.toDispose.push(() => {
            this.controller.abortRead();
            this.controller.dispose();
            this.xterm.dispose();
            this.ui.stop();
        });
    }
    stop() {
        for (const dispose of this.toDispose) {
            dispose();
        }
        this.shell = null;
        this.controller = null;
        this.xterm = null;
    }
    toggle(status) {
        if (status) {
            this.xterm.focus();
        }
    }
    async runCommandLoop() {
        while (true) {
            let line = '';
            try {
                line = await this.controller.read('odss> ');
            }
            catch (err) {
                console.log(err);
                break;
            }
            try {
                const result = await this.shell?.execute(line);
                this.controller.println(result);
            }
            catch (err) {
                this.controller.println(err);
            }
        }
    }
}
exports.TerminalService = TerminalService;
