import { ICommand, ICommandHandler, ICommands, IShell } from "./types";

export class CommandService implements ICommand {
    static NAMESPACE = '@odss/common';

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
