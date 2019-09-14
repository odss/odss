import { IShell } from "@odss/api";

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
        return [];
    }

    async complete3(line: string): Promise<any> {
        let args = line.trim().split(' ');
        let names = this.shell.getCommandsName();

        //all commands
        let name = args.shift();
        if (!name) {
            return names;
        }

        let command = this.shell.getCommand(name);
        if (command) {
            if (typeof command.complete === 'function') {
                const options = await command.complete(args);
                if (options.length === 1) {
                    return {
                        names: name + ' ' + options[0],
                    };
                } else if (options.length > 1) {
                    return [name + ' ' + intersection(options)]
                }
            }
        } else {
            //need suggest something
            let founded: string[] = [],
                cname;
            for (let i = 0; i < names.length; i++) {
                cname = names[i];
                if (cname.indexOf(name) === 0) {
                    founded.push(cname);
                }
            }

            // resolve([intersection(founded), founded.length > 1 ? founded : []]);
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
