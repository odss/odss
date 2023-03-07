"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activator = void 0;
const common_1 = require("@odss/common");
const terminal_1 = require("./terminal");
class Activator {
    service = new terminal_1.TerminalService();
    start(ctx) {
        this.service.start();
        new ShellTracker(ctx, this.service).open();
    }
    stop(ctx) {
        this.service.stop();
    }
}
exports.Activator = Activator;
class ShellTracker extends common_1.ServiceTracker {
    terminal;
    constructor(ctx, terminal) {
        super(ctx, common_1.ShellService);
        this.terminal = terminal;
    }
    async addingService(shell) {
        this.terminal.attach(shell);
    }
    async modifiedService() { }
    async removedService(shell) {
        this.terminal.detach();
    }
}
