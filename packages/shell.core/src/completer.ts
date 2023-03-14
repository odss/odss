import { CommandsRegistry } from './registry';

export class Completer {
    constructor(private registry: CommandsRegistry) {}

    async resolve(line: string): Promise<string[]> {
        if (line.trim().length === 0) {
            return [...this.registry.getCommands().keys()];
        }

        // final command
        const result = this.registry.resolve(line);
        if (result) {
            if (result.command.complete) {
                return result.command.complete(result.args);
            }
            return result.args;
        }

        const args = line.trim().split(' ');
        const last = args.pop();
        let names = [];
        if (args.length) {
            const cmds = [...this.registry.getCommands(args.join('/')).keys()];
            if (cmds.length) {
                names = cmds;
            } else {
                return [];
            }
        } else {
            const cmd = this.registry.getCommand(last);
            if (cmd) {
                return [...this.registry.getCommands(last).keys()];
            }
            names = [...this.registry.getCommands().keys()];

        }

        const founded: string[] = [];
        for (let i = 0; i < names.length; i++) {
            const cname = names[i];
            if (cname.startsWith(last)) {
                founded.push(cname);
            }
        }
        return founded;
    }
}

function intersection(items: string[]): string {
    if (items.length === 0) {
        return '';
    }
    if (items.length === 1) {
        return items[0] + ' ';
    }

    let buff = '';
    let pos = 0;

    //more secure in loop - find shortes item
    let min = items[0].length;
    for (let i = 1; i < items.length; i++) {
        if (items[i].length < min) {
            min = items[i].length;
        }
    }
    while (pos < min) {
        let letter = '';
        for (let i = 0; i < items.length; i++) {
            if (letter === null) {
                letter = items[i].charAt(pos);
                continue;
            }
            if (letter !== items[i].charAt(pos)) {
                pos = min; //stop while
                letter = '';
                break;
            }
        }
        buff += letter;
        ++pos;
    }
    return buff;
}
