import {ICommand} from 'odss.api';


export default (ctx, shell) =>
    COMMANDS.map(option => new Command(ctx, shell, option));

const COMMANDS = [];


class Command{
    constructor(ctx, shell, options){
        this.ctx = ctx;
        this.shell = shell;
        ICommand.extendProperty(this, options);
    }
}

COMMANDS.push({
    name: 'shutdown',
    description: 'Shutdown application',
    man: 'shutdown <bundle.id>',
    execute: function(context) {

    }
});

COMMANDS.push({
    name: 'install',
    description: 'Install bundle',
    man: 'install <bundle.location> (--autostart, -a)',
    execute: function(args) {
        let autostart = args.length === 2 ? args[1] === '-a' || args[1] === '--autostart' : false;
        this.ctx.bundles.install(args[0], autostart);
    }
});
COMMANDS.push({
    name: 'reload',
    description: 'Reload bundle',
    man: 'reload <bundle.id> [-a, --auto-start]',
    execute: function(args, out, err) {
        if (args.length) {
            let sid = args.shift();
            if (!/([^0-9])/.test(sid)) {
                sid = parseInt(sid, 10);
            }
            let autostart = false;
            if (args.length) {
                let next = args.shift();
                if (next === '-a' || next === '--auto-start') {
                    autostart = true;
                } else {
                    err(this.getName() + ': Incorect option: ' + next);
                    return;
                }
            }
            this.ctx.bundles.get(sid).reload(autostart);
        } else {
            err('Expected bundle: "id" or "location"');

        }

    }
});
COMMANDS.push({
    name: 'uninstall',
    description: 'Uninstall bundle',
    man: 'uninstall <bundle.id>',
    execute: function(args, out) {
        let sid = args.shift();
        if (!/([^0-9])/.test(sid)) {
            sid = parseInt(sid, 10);
        }
        let bundle = this.ctx.bundles.get(sid);
        bundle.uninstall();
        out('Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') unistalled');
    },
    complete: function(args, callback) {
        let ctx = this.ctx;
        let getNames = function() {
            let bundles = ctx.bundles.all();
            let buff = [];
            for (let i = 0; i < bundles.length; i++) {
                buff.push(bundles[i].meta.location);
            }
            return buff;
        };
        if (args.length === 0) {
            callback(getNames());
            return;
        } else if (args.length === 1) {
            let name = args[0],
                bnames = getNames(),
                founded = [],
                bname;
            for (let i = 0; i < bnames.length; i++) {
                bname = bnames[i];
                if (bname.indexOf(name) === 0) {
                    founded.push(bname);
                }
            }
            callback(founded);
        }
    }
});
COMMANDS.push({
    name: 'start',
    man: 'start <bundle.id>',
    description: 'Start bundle',
    execute: function(args, out) {
        let sid = args.shift();
        if (!/([^0-9])/.test(sid)) {
            sid = parseInt(sid, 10);
        }
        let bundle = this.ctx.bundles.get(sid);
        bundle.start();
        out('Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') started');
    }
});
COMMANDS.push({
    name: 'stop',
    description: 'Stop bundle',
    man: 'stop <bundle.id>',
    execute: function(args, out, err) {
        if (args.length) {
            let bid = args.shift();
            if (!/([^0-9])/.test(bid)) {
                bid = parseInt(bid, 10);
            }
            let bundle = this.ctx.bundles.get(bid);
            bundle.stop();
            out('Bundle(id=' + bundle.id + ' location=' + bundle.meta.location + ') stopped');
        } else {
            err('Not found param: <bundle_id>');
        }
    }
});
COMMANDS.push({
    name: 'ls',
    description: 'List of bundles',
    man: 'ls',
    execute: function(args, out, err) {
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
        let bundles = this.ctx.bundles.all(),
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
        out(s);
    }
});

COMMANDS.push({
    name: 'help',
    description: 'Show help for command',
    man: 'help [bundle.name]',
    execute: function(args, out, err) {
        let s = '';
        if (args.length === 1) {
            let name = args[0];
            let COMMANDS = this.shell.getCommands();
            for (let i = 0, j = COMMANDS.length; i < j; i++) {
                let cmd = COMMANDS[i];
                if (cmd.name === name) {
                    s = cmd.name + ' - ' + cmd.description + '\nUsage: \n  > ' + cmd.man + '\n';
                    break;
                }
            }
        } else {
            s = 'Use: help <command>';
        }
        out(s);
    },
    complete: function(args, callback) {
        if (args.length === 0) {
            callback(this.shell.getCommandsName());
            return;
        } else if (args.length === 1) {
            let name = args[0];
            let cnames = this.shell.getCommandsName(),
                founded = [],
                cname;
            for (let i = 0; i < cnames.length; i++) {
                cname = cnames[i];
                if (cname.indexOf(name) === 0) {
                    founded.push(cname);
                }
            }
            callback(founded);
        }
    }
});
