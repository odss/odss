import { IBundleContext, CommandShellService, CommandsService, CommandService } from '@odss/common';

import { BasicCommands, HelpCommand } from './basic-commands';
import { CommandsTracker, CommandHandlersTracker } from './trackers';
import { CommandsRegistry } from './registry';
import { Shell } from './shell';

export class Activator {
    private shell: Shell;
    private registry: CommandsRegistry;

    start(ctx: IBundleContext): void {
        this.registry = new CommandsRegistry()
        this.shell = new Shell(this.registry);

        //create and register all core commands
        ctx.registerService(CommandsService, new BasicCommands(ctx, this.registry));
        ctx.registerService(CommandService, new HelpCommand(this.registry));
        ctx.registerService(CommandShellService, this.shell);

        new CommandsTracker(ctx, this.registry).open();
        new CommandHandlersTracker(ctx, this.registry).open();
    }
    stop(): void {
        this.shell = null;
    }
}
