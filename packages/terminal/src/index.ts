import { ShellService, IShell, IBundleContext, ServiceTracker } from '@odss/common';

import { TerminalService } from './terminal';

export class Activator {
    service: TerminalService = new TerminalService();

    start(ctx: IBundleContext) {
        this.service.start();
        new ShellTracker(ctx, this.service).open();

    }
    stop(ctx: IBundleContext) {
        this.service.stop();
    }
}

class ShellTracker extends ServiceTracker<IShell> {
    constructor(ctx: IBundleContext, private terminal: TerminalService) {
        super(ctx, ShellService);
    }
    async addingService(shell: IShell) {
        this.terminal.attach(shell);
    }
    async modifiedService() { }

    async removedService(shell: IShell) {
        this.terminal.detach();
    }
}
