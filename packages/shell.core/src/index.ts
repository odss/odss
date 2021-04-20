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

        new CommandsTracker(ctx, this.shell).open();
        new CommandHandlersTracker(ctx, this.shell).open();

        //create and register all core commands
        ctx.registerService(ShellCommandsService, new BasicCommands(ctx, this.shell));
        ctx.registerService(ShellService, this.shell);
    }
    stop(): void {
        this.shell = null;
    }
}
