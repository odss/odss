export interface ICommandOption {
    readonly name: string;
    readonly flags: string;
    readonly description: string;
    readonly defaultValue: any;
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
    id: string;
    description?: string | null;
    options?: ICommandOption[]

    execute(cmdLine: string[]): Promise<string>;
    complete?(cmdLine: string[]): Promise<string[]>
}

export class CommandService {
    static NAMESPACE = 'odss.api.shell'
}
export class ShellService {
    static NAMESPACE = 'odss.api.shell'
}
