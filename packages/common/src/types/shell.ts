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
