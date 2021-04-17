import { IShell, ICommand } from '@odss/common';

import Completer from './completer';

const DEFAULT_NAMESPACE = 'default';

export class Shell implements IShell {
    private _commands: Map<string, ICommand> = new Map();
    private _completer = new Completer(this);

    hasCommand(name: string): boolean {
        return this._commands.has(name);
    }

    addCommand(command: ICommand): void {
        for (const name of getCommandNames(command)) {
            this._addCommand(name, command);
        }
    }
    private _addCommand(name: string, command: ICommand): void {
        if (this._commands.has(name)) {
            throw new Error(`Command: ${name} is already registered`);
        }
        this._commands.set(name, command);
    }
    removeCommand(command: ICommand): void {
        for (const name of getCommandNames(command)) {
            this._removeCommand(name);
        }
    }
    private _removeCommand(name: string): void {
        if (this._commands.has(name)) {
            this._commands.delete(name);
        } else {
            throw new Error(`Not found command: ${name}`);
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

    getCommandUsage(name: string): string {
        const command = this.getCommand(name);
        if (command) {
            return command.name;
        }
        return '';
    }

    getCommandDescription(name: string): string {
        const command = this.getCommand(name);
        if (command) {
            return command.description || '';
        }
        return '';
    }

    async execute(cmdLine: string): Promise<string> {
        const args = cmdLine.split(' ');
        const cmdName = args.shift();
        if (cmdName) {
            const command = this.getCommand(cmdName);
            const result = await command.execute(args);
            if (result) {
                return result;
            }
            return '';
        }
        throw Error('Not found');
    }

    async complete(cmdLine: string): Promise<string[]> {
        return await this._completer.complete(cmdLine);
    }
}

function* getCommandNames({ name, alias, namespace }: ICommand): Iterable<string> {
    const names = [name];
    if (alias) {
        if (!Array.isArray(alias)) {
            alias = [alias];
        }
        names.push(...alias);
    }

    namespace = namespace || DEFAULT_NAMESPACE;
    for (const name of names) {
        yield namespace == DEFAULT_NAMESPACE ? name : `${namespace}:${name}`;
    }
}
