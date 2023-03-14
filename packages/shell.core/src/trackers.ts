import {
    IBundleContext,
    ICommand,
    ICommands,
    ICommandHandler,
    Metadata,
    ServiceTracker,
    CommandService,
    CommandsService,
    ICommandOptions,
} from '@odss/common';

import { MetadataTypes } from '@odss/shell';
import { CommandsRegistry } from './registry';

export class CommandsTracker extends ServiceTracker {
    constructor(ctx: IBundleContext, private registry: CommandsRegistry) {
        super(ctx, CommandService);
    }

    async addingService(command: ICommand): Promise<void> {
        this.registry.addCommand(command);
    }
    async modifiedService(): Promise<void> {}

    async removedService(command: ICommand): Promise<void> {
        this.registry.removeCommand(command);
    }
}

export class CommandHandlersTracker extends ServiceTracker {
    private _handlers: WeakMap<ICommands, ICommand[]> = new WeakMap();

    constructor(ctx: IBundleContext, private registry: CommandsRegistry) {
        super(ctx, CommandsService);
    }

    async addingService(command: ICommands): Promise<void> {
        this.bindCommands(command);
    }
    async modifiedService(): Promise<void> {}

    async removedService(command: ICommands): Promise<void> {
        this.unbindCommands(command);
    }
    bindCommands(command: ICommands): void {
        if (this._handlers.has(command)) {
            throw new Error(`Command: ${command.constructor.name} is already registered`);
        }
        const { prefix } = Metadata.target(command.constructor).get(MetadataTypes.SHELL_COMMANDS) || [];
        const metadataHandlers =
            Metadata.scanByKey<ICommands, ICommandOptions>(
                command,
                null,
                MetadataTypes.SHELL_COMMANDS_HANDLER
            ) || [];
        const handlers: ICommand[] = [];

        for (const { handler, metadata: { id, ...props } } of metadataHandlers) {
            const execute = handler.bind(command) as ICommandHandler;
            const cmd = {
                ...props,
                id: prefix ? `${prefix}/${id}` : id,
                execute,
            };
            this.registry.addCommand(cmd);
            handlers.push(cmd);
        }
        this._handlers.set(command, handlers);
    }
    unbindCommands(command: ICommands): void {
        const cmds = this._handlers.get(command) || [];
        for (const cmd of cmds) {
            this.registry.removeCommand(cmd);
        }
        this._handlers.delete(command);
    }
}
