import { IShell, ICommand } from '@odss/common';

import { Completer } from './completer';
import { CommandsRegistry } from './registry';

export class Shell implements IShell {
    private completer: Completer;

    constructor(private registry: CommandsRegistry) {
        this.completer = new Completer(registry);
    }

    async execute(line: string): Promise<string> {
        if (line) {
            const result = this.registry.resolve(line);
            if (result) {
                const { node: { command }, args } = result;
                const output = await command.execute(args) as any;
                if (typeof output === 'undefined' || output === null) {
                    return '';
                }
                if (typeof output === 'string') {
                    return output || '';
                }
                try {
                    return JSON.stringify(output, null, 2);
                } catch(err){
                    console.error(err);
                }
                return output.toString();
            }
            throw new Error(`Not found command: ${line}`);
        }
        throw Error('Not found command');
    }

    async complete(line: string): Promise<string[]> {
        return this.completer.resolve(line);
    }
}
