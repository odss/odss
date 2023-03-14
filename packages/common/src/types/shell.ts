export interface ICommandOptions {
    readonly id: string;
    readonly alias?: string | string[];
    readonly description?: string;
    readonly help?: string;
}
export interface ICommandHandler {
    (args: string[]): Promise<string> | string | undefined;
}
export interface ICommands {
    [key: string]: ICommandHandler;
}
export interface ICommandComplete {
    (args: string[]): Promise<string[]> | string[];
}
export interface ICommand extends ICommandOptions {
    execute: ICommandHandler;
    complete?: ICommandComplete;
}
export interface ICommandHandlerMetadata {
    key: string;
    options: ICommandOptions;
}
export interface ICommandsMetadata {
    prefix: string;
}

export interface IShell {
    execute(line: string): Promise<string>;
    complete(line: string): Promise<string[]>;
}
export class CommandService implements ICommand {
    readonly id: string;
    readonly alias?: string | string[];
    readonly description?: string;
    execute(): Promise<string> {
        throw new TypeError('Method not implemented.');
    }
}
export class CommandsService implements ICommands {
    static NAMESPACE = '@odss/common';
    [key: string]: ICommandHandler;
}

export class ShellService implements IShell {
    static NAMESPACE = '@odss/common';

    execute(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    complete(): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
}
