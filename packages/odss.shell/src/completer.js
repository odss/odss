export default class Completer{
    constructor(shell) {
        this.shell = shell;
    }

    complete(line, callback) {
        let args = line.trim().split(' ');
        //for one argument
        if (args.length === 0) {
            return;
        }
        let name = args.shift();
        let cnames = this.shell.getCommandsName();

        //all commands
        if (!name) {
            callback('', cnames);
            return;
        }

        let command = this.shell.getCommand(name);
        if (command) {
            if (typeof command.complete === 'function') {
                command.complete(args, function(options) {
                    if (options.length === 1) {
                        callback(name + ' ' + options[0], []);
                    } else if (options.length > 1) {
                        callback(name + ' ' + intersection(options), options);
                    }

                });
            }
        } else {
            //need suggest something
            let founded = [],
                cname;
            for (let i = 0; i < cnames.length; i++) {
                cname = cnames[i];
                if (cname.indexOf(name) === 0) {
                    founded.push(cname);
                }
            }
            callback(intersection(founded), founded.length > 1 ? founded : []);
        }
    }
}

/**
 *
 * @param {Array} items
 * @returns {String}
 */
function intersection(items) {
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
    let i;
    for (i = 1; i < items.length; i++) {
        if (items[i].length < min) {
            min = items[i].length;
        }
    }
    while (pos < min) {
        let letter = null;
        for (i = 0; i < items.length; i++) {
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
