import { IShell, ICommand, ICommands, ICommandOptions, HandlersContext, HandlerTypes, ICommandHandler } from '@odss/common';

import Completer from './completer';

interface ICommandOptionsHandler {
    key: string,
    options: ICommandOptions,
}
export default class Shell implements IShell {
    private _handlers: Map<ICommands, ICommand[]> = new Map();
    private _commands: Map<string, ICommand> = new Map();
    private _completer = new Completer(this);


    bindCommands(command: ICommands) {
        const metadata = HandlersContext.get<ICommandOptionsHandler[]>(command.constructor).getHandler(HandlerTypes.SHELL_COMMAND) || [];
        const handlers: ICommand[] = [];
        for(const { key, options } of metadata) {
            const execute = command[key].bind(command) as ICommandHandler;
            const cmd = {
                ...options,
                execute,
            }
            this.addCommand(cmd);
            handlers.push(cmd);
        }
        this._handlers.set(command, handlers);
    }
    unbindCommands(command: ICommands) {
        const cmds = this._handlers.get(command) || [];
        for( const cmd of cmds) {
            this.removeCommand(cmd);
        }
        this._handlers.delete(command);

    }
    hasCommand(name: string): boolean {
        return this._commands.has(name);
    }

    addCommand(command: ICommand): void {
        if (this._commands.has(command.name)) {
            throw new Error('Command(id= ' + command.name + ') is already registered');
        }
        this._commands.set(command.name, command);
    }

    removeCommand(command: ICommand) {
        if (this._commands.has(command.name)) {
            this._commands.delete(command.name);
        } else {
            throw new Error(`Not found command: ${command.name}`);
        }
    }

    getCommands(): ICommand[] {
        return [...this._commands.values()];
    }

    getCommandsName(): string[] {
        return [...this._commands.keys()];
    }

    getCommand(name: string): ICommand {
        if (this._commands.has(name)) {
            return this._commands.get(name) as ICommand;
        }
        throw new Error(`Not found command: ${name}`);
    }

    /**
     *
     * @param {String} id Command id
     * @return {String} Command usage
     */
    getCommandUsage(id: string): string {
        let command = this.getCommand(id);
        if (command) {
            return command.name;
        }
        return '';
    }

    /**
     *
     * @param {String} id Command id
     * @return {String} Command description
     */
    getCommandDescription(id: string): string {
        let command = this.getCommand(id);
        if (command) {
            return command.description || '';
        }
        return '';
    }

    /**
     *
     * @param {String} cmdLine
     * @param {Callback} out
     * @param {Callback} err
     */
    async execute(cmdLine: string): Promise<string> {
        let args = cmdLine.split(' ');
        let cmdName = args.shift();
        if (cmdName) {
            let command = this.getCommand(cmdName);
            const result = await command.execute(args);
            if (result ) {
                return result;
            }
            return ''
        }
        throw Error(`Not found`);
    }
    async complete(cmdLine: string): Promise<string[]> {
        return await this._completer.complete(cmdLine);
    }
}
