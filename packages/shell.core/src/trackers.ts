import {
    IBundleContext,
    ICommand,
    ICommands,
    ICommandHandler,
    ICommandsMetadata,
    ICommandHandlerMetadata,
    IShell,
    Metadata,
    ServiceTracker,
    ShellCommandService,
    ShellCommandsService,
    ICommandOptions,
} from '@odss/common';

import { MetadataTypes } from '@odss/shell';

export class CommandsTracker extends ServiceTracker {
    constructor(ctx: IBundleContext, private shell: IShell) {
        super(ctx, ShellCommandService);
    }

    addingService(command: ICommand): void {
        this.shell.addCommand(command);
    }
    modifiedService(): void {}

    removedService(command: ICommand): void {
        this.shell.removeCommand(command);
    }
}

export class CommandHandlersTracker extends ServiceTracker {
    private _handlers: Map<ICommands, ICommand[]> = new Map();

    constructor(ctx: IBundleContext, private shell: IShell) {
        super(ctx, ShellCommandsService);
    }

    addingService(command: ICommands): void {
        this.bindCommands(command);
    }
    modifiedService(): void {}

    removedService(command: ICommands): void {
        this.unbindCommands(command);
    }
    bindCommands(command: ICommands): void {
        const { namespace } =
            Metadata.target(command.constructor).get(MetadataTypes.SHELL_COMMANDS) || [];

        const metadataHandlers =
            Metadata.scanByKey<ICommands, ICommandOptions>(
                command, null,
                MetadataTypes.SHELL_COMMANDS_HANDLER
            ) || [];
        const handlers: ICommand[] = [];
        for (const { method, metadata } of metadataHandlers) {
            const execute = method.bind(command) as ICommandHandler;
            const cmd = {
                namespace,
                ...metadata,
                execute,
            };
            this.shell.addCommand(cmd);
            handlers.push(cmd);
        }
        this._handlers.set(command, handlers);
    }
    unbindCommands(command: ICommands): void {
        const cmds = this._handlers.get(command) || [];
        for (const cmd of cmds) {
            this.shell.removeCommand(cmd);
        }
        this._handlers.delete(command);
    }
}
