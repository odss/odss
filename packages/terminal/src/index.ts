import { CommandShellService, ICommandShell, IBundleContext, ServiceTracker } from '@odss/common';

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

class ShellTracker extends ServiceTracker<ICommandShell> {
    constructor(ctx: IBundleContext, private terminal: TerminalService) {
        super(ctx, CommandShellService);
    }

    async addingService(shell: ICommandShell) {
        this.terminal.attach(shell);
    }

    async modifiedService() {}

    async removedService(shell: ICommandShell) {
        this.terminal.detach();
    }
}
