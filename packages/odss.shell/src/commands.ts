import { IShell, ICommand } from '@odss/api';



abstract class ShellCommand implements ICommand {
    abstract id: string;

    constructor(
        protected ctx: any,
        protected shell: IShell,
    ) {}
    abstract execute(args: string[]): Promise<string>;
}

// description: 'Shutdown application',
// man: 'shutdown <bundle.id>',
export class ShutdownCommand extends ShellCommand {
    readonly id: string = 'shutdown';

    async execute(args: string[]): Promise<string> {
        return '';
    }
}

// description: 'Install bundle',
// man: 'install <bundle.location> (--autostart, -a)',
export class InstallCommand extends ShellCommand {

    readonly id: string = 'install';

    async execute(args: string[]): Promise<string> {
        let autostart = args.length === 2 ? args[1] === '-a' || args[1] === '--autostart' : false;
        let bundle = await this.ctx.installBundle(args[0], autostart);
        return 'Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') installed';
    }
}

// description: 'Reload bundle',
// man: 'reload <bundle.id> [-a, --auto-start]',
export class ReloadCommand extends ShellCommand {

    readonly id: string = 'reload';

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
                    throw new Error(this.id + ': Incorect option: ' + next);
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

    readonly id: string = 'uninstall';

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
            const bids: string[] = getNames();
            const id = args[0];
            const founded: string[] = [];
            let bid: string;
            for (let i = 0; i < bids.length; i++) {
                bid = bids[i];
                if (bid.indexOf(id) === 0) {
                    founded.push(bid);
                }
            }
            return founded;
        }
        return [];
    }
}

export class StartCommand extends ShellCommand {

    readonly id: string = 'start';

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

    readonly id: string = 'stop';

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

    readonly id: string = 'ls';

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

    readonly id: string = 'help';

    async execute(args: string[]): Promise<string> {
    // description: 'Show help for command',
    // man: 'help [bundle.id]',
        if (args.length === 1) {
            let id = args[0];
            let COMMANDS = this.shell.getCommands();
            for (let i = 0, j = COMMANDS.length; i < j; i++) {
                let cmd = COMMANDS[i];
                if (cmd.id === id) {
                    return cmd.id;
                    // return cmd.config.id + ' - ' + cmd.config.description + '\nUsage: \n  >\n';
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
            const id: string = args[0];
            const cids: string[] = this.shell.getCommandsName();
            const founded: string[] = [];
            let cid: string;
            for (let i = 0; i < cids.length; i++) {
                cid = cids[i];
                if (cid.indexOf(id) === 0) {
                    founded.push(cid);
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