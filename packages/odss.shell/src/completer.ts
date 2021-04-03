import { IShell } from "@odss/common";

export default class Completer {
    constructor(private shell: IShell) {
    }

    async complete(line: string): Promise<string[]> {
        let args = line.trim().split(' ');
        let names = this.shell.getCommandsName();

        //all commands
        let name = args.shift();
        if (!name) {
            return names;
        }

        if (this.shell.hasCommand(name)) {
            let command = this.shell.getCommand(name);
            // if (typeof command.complete === 'function') {
            //     return await command.complete(args);
            // }
        } else {
            //need suggest something
            const founded: string[] = [];
            for (let i = 0; i < names.length; i++) {
                const cname = names[i];
                if (cname.indexOf(name) === 0) {
                    founded.push(cname);
                }
            }
            return founded;
            // return await ([intersection(founded), founded.length > 1 ? founded : []]);
        }
        return [];
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
