import { ID_SEPARATOR } from './consts';
import { CommandsRegistry } from './registry';
import { toPath } from './utils';

export class Completer {
    constructor(private registry: CommandsRegistry) {}

    async resolve(line: string): Promise<string[]> {

        if (line.trim().length === 0) {
            return [...this.registry.getNode().keys()];
        }
        const result = this.registry.resolve(line);
        if (result) {
            const { command, args } = result;
            if (command.complete) {
                return command.complete(args || []);
            }
            return [];
        }
        return this.getPropose(line);
    }
    private getPropose(line: string): string[] {
        const path = toPath(line);
        const len = path.length;
        for(let i = 0; i<2; i+=1){
            const id = path.slice(0, len-i);
            const last = path[len-i] || '';
            const node = this.registry.getNode(id);
            if (node) {
                return this.fuzzSearch(node.keys(), last);
            }
        }
        return [];
    }
    private fuzzSearch(values: string[], part: string) {
        const founded: string[] = [];
        for (let i = 0; i < values.length; i++) {
            const cname = values[i];
            if (cname.startsWith(part)) {
                founded.push(cname);
            }
        }
        return founded;
    }
}
