export const IShell = 'odss-api.IShell';
export const ICommand = 'odss-api.ICommand';

export type CommandConfigOption = {
    readonly name: string,
    readonly flags: string,
    readonly description: string,
    readonly default: any,
};

export type CommandConfig = {
    readonly name: string,
    readonly description: string,
    readonly options: CommandConfigOption[],
};

export type CompleteResponse = {
    names?: string[],
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

export interface ICommand {
    readonly name: string;

    execute(cmdLine: string[]): Promise<string>;
    complete?(cmdLine: string[]): Promise<string[]>
}
