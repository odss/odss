import { IShell, ICommand, CompleteResponse } from '@odss/api';

import Completer from './completer';

export default class Shell implements IShell {
    private _commands: ICommand[] = [];
    private _completer = new Completer(this);

    hasCommand(name: string): boolean {
        for (let i = 0; i < this._commands.length; i++) {
            if (this._commands[i].name === name) {
                return true;
            }
        }
        return false;
    }

    addCommand(cmd: ICommand): void {
        if (this.hasCommand(cmd.name)) {
            throw new Error('Command(name= ' + cmd.name + ') is already registered');
        }
        this._commands.push(cmd);
    }
    /**
     *
     * @param {String|odss-api.Command} cmd Command or command name
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
     * @return {Array} Return list of commands services name
     */
    getCommandsName(): string[] {
        let buff: string[] = [];
        for (let i = 0, j = this._commands.length; i < j; i++) {
            buff.push(this._commands[i].name);
        }
        return buff;
    }

    /**
     * @param {String} name Command name
     */
    getCommand(name): ICommand {
        for (let i = 0, j = this._commands.length; i < j; i++) {
            let command = this._commands[i];
            if (command.name === name) {
                return command;
            }
        }
        throw new Error(`Not found command: ${name}`);
    }

    /**
     *
     * @param {String} name Command name
     * @return {String} Command usage
     */
    getCommandUsage(name: string): string {
        let command = this.getCommand(name);
        if (command) {
            return command.name;
        }
        return '';
    }

    /**
     *
     * @param {String} name Command name
     * @return {String} Command description
     */
    getCommandDescription(name: string): string {
        let command = this.getCommand(name);
        if (command) {
            return command.name;
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

