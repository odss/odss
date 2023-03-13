
export interface ICommandOptions {
    readonly name: string;
    readonly namespace?: string;
    readonly alias?: string | string[];
    readonly description?: string;
}
export interface ICommandHandler {
    (args: string[]): Promise<string> | string | undefined;
}
export interface ICommands {
    [key: string]: ICommandHandler;
}
export interface ICommandComplete {
    (line: string): Promise<string[]> | string[];
}
export interface ICommand extends ICommandOptions {
    execute: ICommandHandler;
    complete?: ICommandComplete,
}
export interface ICommandHandlerMetadata {
    key: string;
    options: ICommandOptions;
}
export interface ICommandsMetadata {
    namespace: string;
}
export interface ICommandRegistry {
    hasCommand(id: string): void;
    addCommand(command: ICommand): void;
    removeCommand(command: ICommand): void;
    getCommands(): ICommand[];
    getCommandsName(): string[];
    getCommand(id: string): ICommand;
    getCommandUsage(id: string): string;
    getCommandDescription(id: string): string;
}
export interface IShell {
    execute(line: string): Promise<string>;
    complete(line: string): Promise<string[]>;
}

export class ShellCommandService implements ICommand {
    name: string;
    namespace?: string;
    alias?: string | string[];
    description?: string;

    execute(): Promise<string> {
        throw new TypeError('Method not implemented.');
    }
}
export class ShellCommandsService implements ICommands {
    static NAMESPACE = '@odss/common';

    [key: string]: ICommandHandler;
}

export abstract class ShellService implements IShell {
    static NAMESPACE = '@odss/common';

    hasCommand(): boolean {
        throw new Error('Method not implemented.');
    }
    addCommand(): void {
        throw new Error('Method not implemented.');
    }
    removeCommand(): void {
        throw new Error('Method not implemented.');
    }
    getCommands(): ICommand[] {
        throw new Error('Method not implemented.');
    }
    getCommandsName(): string[] {
        throw new Error('Method not implemented.');
    }
    getCommand(): ICommand {
        throw new Error('Method not implemented.');
    }
    getCommandUsage(): string {
        throw new Error('Method not implemented.');
    }
    getCommandDescription(): string {
        throw new Error('Method not implemented.');
    }
    execute(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    complete(): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
}
