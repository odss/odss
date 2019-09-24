import { IShell, ICommand } from '@odss/api';
declare abstract class ShellCommand implements ICommand {
    protected ctx: any;
    protected shell: IShell;
    abstract id: string;
    constructor(ctx: any, shell: IShell);
    abstract execute(args: string[]): Promise<string>;
}
export declare class ShutdownCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
}
export declare class InstallCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
}
export declare class ReloadCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
}
export declare class UninstallCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
    complete(args: string[]): Promise<string[]>;
}
export declare class StartCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
}
export declare class StopCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
}
export declare class ListCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
}
export declare class HelpCommand extends ShellCommand {
    readonly id: string;
    execute(args: string[]): Promise<string>;
    complete(args: string[]): Promise<string[]>;
}
export declare const AllCommands: (typeof InstallCommand)[];
export {};
