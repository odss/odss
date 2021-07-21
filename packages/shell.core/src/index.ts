import {
    IBundleContext,
    ShellService,
    ShellCommandsService,
} from '@odss/common';
import { Shell } from '@odss/shell';

import { BasicCommands } from './commands';
import { CommandsTracker, CommandHandlersTracker } from './trackers';

export class Activator {
    private shell: Shell | null = null;

    start(ctx: IBundleContext): void {
        this.shell = new Shell();

        //create and register all core commands
        ctx.registerService(ShellCommandsService, new BasicCommands(ctx, this.shell));
        ctx.registerService(ShellService, this.shell);

        new CommandsTracker(ctx, this.shell).open();
        new CommandHandlersTracker(ctx, this.shell).open();
    }
    stop(): void {
        this.shell = null;
    }
}
