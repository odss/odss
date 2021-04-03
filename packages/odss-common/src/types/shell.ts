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
export interface ICommand extends ICommandOptions {
    execute: ICommandHandler,
}

export interface IShell {
    hasCommand(name: string): boolean;
    addCommand(cmd: ICommand): void;
    removeCommand(cmd: ICommand): void;
    getCommands(): ICommand[];
    getCommandsName(): string[];
    getCommand(name: string): ICommand;
    getCommandUsage(name: string): string;
    getCommandDescription(name: string): string;
    execute(line: string): Promise<string>;
    complete(line: string): Promise<string[]>;
}

export class ShellCommandService implements ICommand {
    name: string;
    namespace?: string;
    alias?: string | string[];
    description?: string;

    execute(cmdLine: string[]): Promise<string> {
        throw new TypeError("Method not implemented.");
    }
}
export class ShellCommandsService implements ICommands {
    [key: string]: ICommandHandler;
}

export abstract class ShellService implements IShell {
    hasCommand(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    addCommand(cmd: ICommand): void {
        throw new Error("Method not implemented.");
    }
    removeCommand(cmd: ICommand): void {
        throw new Error("Method not implemented.");
    }
    getCommands(): ICommand[] {
        throw new Error("Method not implemented.");
    }
    getCommandsName(): string[] {
        throw new Error("Method not implemented.");
    }
    getCommand(name: string): ICommand {
        throw new Error("Method not implemented.");
    }
    getCommandUsage(name: string): string {
        throw new Error("Method not implemented.");
    }
    getCommandDescription(name: string): string {
        throw new Error("Method not implemented.");
    }
    execute(line: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    complete(line: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
}
