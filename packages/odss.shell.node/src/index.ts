import { ShellService, IShell, IBundleContext } from '@odss/common';

import { TerminalService } from './terminal';

export class Activator {
    service: TerminalService = new TerminalService();

    start(ctx: IBundleContext) {
        const service = this.service;
        service.open();
        ctx.serviceTracker(ShellService, {
            addingService: function(shell: IShell) {
                service.attach(shell);
            },
            modifiedService() { },

            removedService: function(shell: IShell) {
                service.detach();
            }
        }).open();
    }
    stop(ctx: IBundleContext) {
        this.service.close();
    }
}