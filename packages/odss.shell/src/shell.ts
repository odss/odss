import { IShell, ICommand } from '@odss/api';

import Completer from './completer';

export default class Shell implements IShell {
    private _commands: ICommand[] = [];
    private _completer = new Completer(this);

    hasCommand(id: string): boolean {
        for (let i = 0; i < this._commands.length; i++) {
            if (this._commands[i].id === id) {
                return true;
            }
        }
        return false;
    }

    addCommand(command: ICommand): void {
        if (this.hasCommand(command.id)) {
            throw new Error('Command(id= ' + command.id + ') is already registered');
        }
        this._commands.push(command);
    }
    /**
     *
     * @param {String|odss-api.Command} cmd Command or command id
     */
    removeCommand(cmd: ICommand) {
        for (let i = 0; this._commands.length; i++) {
            if (this._commands[i] === cmd) {
                this._commands.splice(i, 1);
                return true;
            }
        }
        throw new Error(`Not found command: ${cmd}`);
    }
    /**
     * @return {Array} Return list of commands services
     */
    getCommands(): ICommand[] {
        return this._commands.concat();
    }

    /**
     * @return {Array} Return list of commands services id
     */
    getCommandsName(): string[] {
        let buff: string[] = [];
        for (let i = 0, j = this._commands.length; i < j; i++) {
            buff.push(this._commands[i].id);
        }
        return buff;
    }

    /**
     * @param {String} id Command id
     */
    getCommand(id): ICommand {
        for (let i = 0, j = this._commands.length; i < j; i++) {
            let command = this._commands[i];
            if (command.id === id) {
                return command;
            }
        }
        throw new Error(`Not found command: ${id}`);
    }

    /**
     *
     * @param {String} id Command id
     * @return {String} Command usage
     */
    getCommandUsage(id: string): string {
        let command = this.getCommand(id);
        if (command) {
            return command.id;
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
            return command.id;
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
            return command.execute(args);
        }
        throw Error(`Not found`);
    }
    complete(cmdLine: string): Promise<string[]> {
        return this._completer.complete(cmdLine);
    }
}

