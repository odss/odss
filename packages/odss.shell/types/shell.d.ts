import { IShell, ICommand } from '@odss/api';
export default class Shell implements IShell {
    private _commands;
    private _completer;
    hasCommand(id: string): boolean;
    addCommand(command: ICommand): void;
    /**
     *
     * @param {String|odss-api.Command} cmd Command or command id
     */
    removeCommand(cmd: ICommand): boolean;
    /**
     * @return {Array} Return list of commands services
     */
    getCommands(): ICommand[];
    /**
     * @return {Array} Return list of commands services id
     */
    getCommandsName(): string[];
    /**
     * @param {String} id Command id
     */
    getCommand(id: any): ICommand;
    /**
     *
     * @param {String} id Command id
     * @return {String} Command usage
     */
    getCommandUsage(id: string): string;
    /**
     *
     * @param {String} id Command id
     * @return {String} Command description
     */
    getCommandDescription(id: string): string;
    /**
     *
     * @param {String} cmdLine
     * @param {Callback} out
     * @param {Callback} err
     */
    execute(cmdLine: string): Promise<string>;
    complete(cmdLine: string): Promise<string[]>;
}
