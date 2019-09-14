import { IShell, ICommand, CommandConfig } from '@odss/api';
import { Command } from './decorators';


// export default (ctx, shell) =>
//     COMMANDS.map(option => new Command(ctx, shell, option));

abstract class ShellCommand implements ICommand {
    abstract name: string;

    constructor(
        protected ctx: any,
        protected shell: IShell,
    ) {}
    abstract execute(args: string[]): Promise<string>;
}
// description: 'Shutdown application',
// man: 'shutdown <bundle.id>',
export class ShutdownCommand extends ShellCommand {
    readonly name: string = 'shutdown';

    async execute(args: string[]): Promise<string> {
        return '';
    }
}

// description: 'Install bundle',
// man: 'install <bundle.location> (--autostart, -a)',

export class InstallCommand extends ShellCommand {

    readonly name: string = 'install';

    async execute(args: string[]): Promise<string> {
        let autostart = args.length === 2 ? args[1] === '-a' || args[1] === '--autostart' : false;
        let bundle = await this.ctx.installBundle(args[0], autostart);
        return 'Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') installed';
    }
}

// description: 'Reload bundle',
// man: 'reload <bundle.id> [-a, --auto-start]',
export class ReloadCommand extends ShellCommand {

    readonly name: string = 'reload';

    async execute(args: string[]): Promise<string> {
        if (args.length) {
            let sid: string | number = args.shift() || '';
            if (!/([^0-9])/.test(sid)) {
                sid = parseInt(sid, 10);
            }
            let autostart = false;
            if (args.length) {
                let next = args.shift();
                if (next === '-a' || next === '--auto-start') {
                    autostart = true;
                } else {
                    throw new Error(this.name + ': Incorect option: ' + next);
                }
            }
            await this.ctx.getBundle(sid).reload(autostart);
            return 'Bundle reloaded';
        } else {
            throw new Error('Expected bundle: "id" or "location"');
        }

    }
}

export class UninstallCommand extends ShellCommand {

    readonly name: string = 'uninstall';

    async execute(args: string[]): Promise<string> {
    // description: 'Uninstall bundle',
    // man: 'uninstall <bundle.id>',
        let sid: string|number = args.shift() || '';
        if (!/([^0-9])/.test(sid)) {
            sid = parseInt(sid, 10);
        }
        let bundle = this.ctx.getBundle(sid);
        bundle.uninstall();
        return 'Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') unistalled';
    }
    async complete(args: string[]): Promise<string[]> {
        let ctx = this.ctx;
        let getNames = function() {
            let bundles = ctx.getBundles();
            let buff = [];
            for (let i = 0; i < bundles.length; i++) {
                // @ts-ignore
                buff.push(bundles[i].meta.location);
            }
            return buff;
        };
        if (args.length === 0) {
            return getNames();
        } else if (args.length === 1) {
            const bnames: string[] = getNames();
            const name = args[0];
            const founded: string[] = [];
            let bname: string;
            for (let i = 0; i < bnames.length; i++) {
                bname = bnames[i];
                if (bname.indexOf(name) === 0) {
                    founded.push(bname);
                }
            }
            return founded;
        }
        return [];
    }
}

export class StartCommand extends ShellCommand {

    readonly name: string = 'start';

    async execute(args: string[]): Promise<string> {

    // man: 'start <bundle.id>',
    // description: 'Start bundle',
        let sid: string | number = args.shift() || '';
        if (!/([^0-9])/.test(sid)) {
            sid = parseInt(sid, 10);
        }
        let bundle = this.ctx.getBundle(sid);
        bundle.start();
        return 'Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') started';
    }
}


export class StopCommand extends ShellCommand {

    readonly name: string = 'stop';

    async execute(args: string[]): Promise<string> {
    // description: 'Stop bundle',
    // man: 'stop <bundle.id>',
        if (args.length) {
            let bid: string | number = args.shift() || '';
            if (!/([^0-9])/.test(bid)) {
                bid = parseInt(bid, 10);
            }
            let bundle = this.ctx.getBundle(bid);
            bundle.stop();
            return ('Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') stopped');
        }
        throw Error('Not found param: <bundle_id>');
    }
}

export class ListCommand extends ShellCommand {

    readonly name: string = 'ls';

    async execute(args: string[]): Promise<string> {
    // description: 'List of bundles',
    // man: 'ls',
        let status = {
            1: 'UNINSTALLED',
            2: 'INSTALLED',
            4: 'RESOLVED',
            8: 'STARTING',
            16: 'STOPPING',
            32: 'ACTIVE'

        };
        let lengths = {
            id: 5,
            version: 10,
            status: 10,
            location: 20
        };
        let space = function(len) {
            let s = '';
            while (len--) {
                s += '=';
            }
            return s;
        };
        let pad = function(str, type) {
            let len = lengths[type] || 10;
            str += '';
            while (str.length < len) {
                str += ' ';
            }
            return str;
        };
        let line = function(id, version, status, location) {
            return pad(id, 'id') + ' ' + pad(version, 'version') + ' ' + pad(status, 'status') + ' ' + pad(location, 'location') + '\n';
        };
        let bundles = this.ctx.getBundles(),
            bundle, i, j;
        for (i = 0, j = bundles.length; i < j; i++) {
            bundle = bundles[i];
            lengths['id'] = Math.max(lengths['id'], (bundle.id + '').length);
            lengths['version'] = Math.max(lengths['version'], bundle.meta.version.length);
            lengths['status'] = Math.max(lengths['status'], status[bundle.state].length);
            lengths['location'] = Math.max(lengths['location'], bundle.meta.location.length);
        }
        let s = line('ID', 'Version', 'Status', 'Namespace');
        s += space(s.length) + '\n';
        for (i = 0, j = bundles.length; i < j; i++) {
            bundle = bundles[i];
            s += line(bundle.id, bundle.meta.version, status[bundle.state] || 'Unknown', bundle.meta.location);
        }
        return s;
    }
}

export class HelpCommand extends ShellCommand {

    readonly name: string = 'help';

    async execute(args: string[]): Promise<string> {
    // description: 'Show help for command',
    // man: 'help [bundle.name]',
        if (args.length === 1) {
            let name = args[0];
            let COMMANDS = this.shell.getCommands();
            for (let i = 0, j = COMMANDS.length; i < j; i++) {
                let cmd = COMMANDS[i];
                if (cmd.name === name) {
                    return cmd.name;
                    // return cmd.config.name + ' - ' + cmd.config.description + '\nUsage: \n  >\n';
                }
            }
        }
        return 'Use: help <command>';
    }
    async complete(args: string[]): Promise<string[]> {
        if (args.length === 0) {
            return this.shell.getCommandsName();
        }
        if (args.length === 1) {
            const name: string = args[0];
            const cnames: string[] = this.shell.getCommandsName();
            const founded: string[] = [];
            let cname: string;
            for (let i = 0; i < cnames.length; i++) {
                cname = cnames[i];
                if (cname.indexOf(name) === 0) {
                    founded.push(cname);
                }
            }
            return founded;
        }
        return [];
    }
}

export const AllCommands = [
    ListCommand,
    StartCommand,
    StopCommand,
    HelpCommand,
    InstallCommand,
    UninstallCommand,
    ReloadCommand,
];