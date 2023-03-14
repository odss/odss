import { ICommandShell, ICommand } from '@odss/common';

import { Completer } from './completer';
import { CommandsRegistry } from './registry';

export class Shell implements ICommandShell {
    private completer: Completer;

    constructor(private registry: CommandsRegistry) {
        this.completer = new Completer(registry);
    }

    async execute(line: string): Promise<string> {
        if (line) {
            const result = this.registry.resolve(line);
            if (!result) {
                throw new Error(`Not found command: ${line}`);
            }
            const { command, args } = result;
            const output = await command.execute(args);
            return output || '';
        }
        throw Error('Not found');
    }

    async complete(cmdLine: string): Promise<string[]> {
        return this.completer.resolve(cmdLine);
    }
}
