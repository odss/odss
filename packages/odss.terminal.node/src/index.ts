import { ShellService, IShell, IBundleContext, ServiceTracker } from '@odss/common';

import { TerminalService } from './terminal';

export class Activator {
    service: TerminalService = new TerminalService();

    start(ctx: IBundleContext) {
        const service = this.service;
        service.open();
        new ShellTracker(ctx, service).open();
    }
    stop(ctx: IBundleContext) {
        this.service.close();
    }
}

class ShellTracker extends ServiceTracker<IShell> {
    constructor(ctx: IBundleContext, private terminal: TerminalService) {
        super(ctx, ShellService);
    }
    addingService(shell: IShell) {
        this.terminal.attach(shell);
    }
    modifiedService() { }

    removedService(shell: IShell) {
        this.terminal.detach();
    }
}