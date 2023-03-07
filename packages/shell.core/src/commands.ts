import {
    IShell,
    IBundleContext,
    SERVICE_RANKING,
    OBJECTCLASS,
    SERVICE_ID,
    ShellCommandsService,
    ShellService,
} from '@odss/common';
import { Command, Commands } from '@odss/shell';

const STATUSES = {
    1: 'UNINSTALLED',
    2: 'INSTALLED',
    4: 'RESOLVED',
    8: 'STARTING',
    16: 'STOPPING',
    32: 'ACTIVE',
};

@Commands()
export class BasicCommands {
    constructor(private ctx: IBundleContext, protected shell: IShell) {}

    @Command({
        name: 'properties',
        description: 'Show all properties',
    })
    properties(args: string[]) {
        return this.ctx?.getProperties() || {};
    }
    @Command({
        name: 'property',
        description: 'Show property value',
    })
    property(args: string[]) {
        return this.ctx?.getProperty(args[0], null);
    }
    @Command({
        name: 'install',
        description: 'Install bundle',
        // man: 'install <bundle.name> (--autostart, -a)',
    })
    async install(args: string[]): Promise<string> {
        const autostart = args.length === 2 ? args[1] === '-a' || args[1] === '--autostart' : false;
        const bundle = await this.ctx?.installBundle(args[0], autostart);
        if (bundle) {
            return 'Bundle(id=' + bundle.id + ' name=' + bundle.name + ') installed';
        }
        return `Not found bundle id=${args[0]}`;
    }

    @Command('reload')
    async reload(args: string[]): Promise<string> {
        if (args.length) {
            let sid: string | number = args.shift() || '';
            if (!/([^0-9])/.test(sid)) {
                sid = parseInt(sid, 10);
            }
            await this.ctx?.getBundle(sid as any).reload();
            return 'Bundle reloaded';
        } else {
            throw new Error('Expected bundle: "id" or "name"');
        }
    }

    @Command('uninstall')
    async uninstall(args: string[]): Promise<string> {
        // description: 'Uninstall bundle',
        // man: 'uninstall <bundle.id>',
        let sid: string | number = args.shift() || '';
        if (!/([^0-9])/.test(sid)) {
            sid = parseInt(sid, 10);
        }
        if (!sid) {
            throw new Error('Incorrect bundle id');
        }
        const bundle = this.ctx?.getBundle(sid as any);
        if (bundle) {
            await bundle.uninstall();
            return 'Bundle(id=' + bundle.id + ' name=' + bundle.name + ') unistalled';
        }
        return `Not found bundle id=${sid}`;
    }

    @Command('start')
    async start(args: string[]): Promise<string> {
        // man: 'start <bundle.id>',
        // description: 'Start bundle',
        let sid: string | number = args.shift() || '';
        if (!/([^0-9])/.test(sid)) {
            sid = parseInt(sid, 10);
        }
        const bundle = this.ctx?.getBundle(sid as any);
        if (bundle) {
            await bundle.start();
            return 'Bundle(id=' + bundle.id + ' name=' + bundle.name + ') started';
        }
        return `Not found bundle id=${sid}`;
    }

    @Command('stop')
    async stop(args: string[]): Promise<string> {
        // description: 'Stop bundle',
        // man: 'stop <bundle.id>',
        if (args.length) {
            let bid: string | number = args.shift() || '';
            if (!/([^0-9])/.test(bid)) {
                bid = parseInt(bid, 10);
            }
            const bundle = this.ctx?.getBundle(bid as any);
            if (bundle) {
                await bundle.stop();
                return 'Bundle(id=' + bundle.id + ' name=' + bundle.name + ') stopped';
            }
        }
        throw Error('Not found param: <bundle_id>');
    }
    @Command({
        name: 'bl',
        description: 'List all installed bundles',
    })
    list(): string {
        const header = ['ID', 'Version', 'Status', 'Name'];
        const bundles = this.ctx?.getBundles() || [];
        const records = [] as any;
        for (const bundle of bundles) {
            records.push([
                bundle.id,
                bundle.version,
                STATUSES[bundle.state] || 'Unknown',
                bundle.name,
            ]);
        }
        return makeAsciiTable('Bundles', header, records);
    }
    @Command({
        name: 'bd',
    })
    bundleDetails(args: string[]): string {
        let sid: string | number = args.shift() || '';
        if (!/([^0-9])/.test(sid)) {
            sid = parseInt(sid, 10);
        }
        const bundle = this.ctx?.getBundle(sid as any);
        if (!bundle) {
            return `Not found bundle id=${sid}`;
        }
        const state = STATUSES[bundle.state];

        const buff = [
            `ID......: ${bundle.id}`,
            `State...: ${state}`,
            `Version.: ${bundle.version}`,
            `Location: ${bundle.name}`,
            'Published services:',
        ];
        bundle.getRegisteredServices().map(ref => buff.push(`     ${ref}`));
        buff.push('Services using by bundle:');
        bundle.getServicesInUse().map(ref => buff.push(`     ${ref}`));
        return buff.join('\n');
    }
    @Command({
        name: 'sl',
    })
    serviceList(): string {
        const bundles = this.ctx?.getBundles() || [];
        const records: string[][] = [];
        for (const bundle of bundles) {
            const refs = bundle.getRegisteredServices();
            const lines = refs.map(ref => [
                ref.getProperty(SERVICE_ID),
                bundle.name,
                ref.getProperty(OBJECTCLASS),
                ref.getProperty(SERVICE_RANKING),
            ]) as any;
            records.push(...lines);
        }
        const header = ['ID', 'Bundle', 'Service', 'Ranking'];
        return makeAsciiTable('Services', header, records);
    }
    @Command({
        name: 'sd',
    })
    serviceDetail(args: string[]): string {
        const id = args.shift();
        const refs =
            this.ctx?.getServiceReferences(null, {
                [SERVICE_ID]: parseInt(id as string, 10),
            }) || [];
        const ref = refs[0];
        const props = ref.getProperties();
        const clasess = props[OBJECTCLASS];
        const lines = [
            `ID...........: ${props[SERVICE_ID]}`,
            `Classes......: ${clasess}`,
            `Rank.........: ${props[SERVICE_RANKING]}`,
            `Properties...:`,
        ];
        const toValue = val => {
            if (Array.isArray(val)) {
                return val.map(toValue).join(' | ');
            }
            return typeof val === 'function' || val.name ? val.name : val;
        };
        for (const [key, value] of Object.entries(props)) {
            lines.push(`    ${key} = ${toValue(value)}`);
        }
        lines.push('Bundles using this service:');
        for (const bundle of ref.usingBundles()) {
            lines.push(`    ${bundle}`);
        }
        return lines.join('\n');
    }

    @Command({
        name: 'exit',
        alias: ['quit', 'shutdown'],
    })
    async exit(): Promise<string> {
        setTimeout(() => (this.ctx as any).framework.stop());
        return 'Stoping';
    }

    @Command({
        name: 'help',
        description: 'Show help for command',
        alias: ['?'],
    })
    async help(args: string[]): Promise<string> {
        if (args.length === 1) {
            const name = args[0];
            for (const cmd of this.shell.getCommands()) {
                if (cmd.name === name) {
                    return cmd.name;
                    // return cmd.config.id + ' - ' + cmd.config.description + '\nUsage: \n  >\n';
                }
            }
            return 'Use: help <command>';
        }
        return 'Comands: ' + this.shell.getCommandsName();
    }
    // async complete(args: string[]): Promise<string[]> {
    //     if (args.length === 0) {
    //         return this.shell.getCommandsName();
    //     }
    //     if (args.length === 1) {
    //         const id: string = args[0];
    //         const cids: string[] = this.shell.getCommandsName();
    //         const founded: string[] = [];
    //         let cid: string;
    //         for (let i = 0; i < cids.length; i++) {
    //             cid = cids[i];
    //             if (cid.indexOf(id) === 0) {
    //                 founded.push(cid);
    //             }
    //         }
    //         return founded;
    //     }
    //     return [];
    // }
}

const makeAsciiTable = (title, headers, records) => {
    const sepTop = sizes => {
        const line = sizes.map(size => '─'.repeat(size + 2)).join('┬');
        return `┌${line}┐`;
    };
    const sepMid = sizes => {
        const line = sizes.map(size => '─'.repeat(size + 2)).join('┼');
        return `├${line}┤`;
    };
    const sepBottom = sizes => {
        const line = sizes.map(size => '─'.repeat(size + 2)).join('┴');
        return `└${line}┘`;
    };

    const sizes: number[] = headers.map(head => head.length);
    const len = val => ('' + val).length;

    records.forEach((records, row) => {
        if (headers.length != records.length) {
            throw new Error(`Diffrent size of headers and records (row=${row}`);
        }
        records.forEach((value, column) => {
            const size = len(value);
            if (sizes[column] < size) {
                sizes[column] = size;
            }
        });
    });

    const sformat = row => {
        const b = sizes.map((size, i) => {
            const value = row[i];
            const w = size - len(value);
            const space = ' '.repeat(Math.ceil(w));
            return `${value}${space}`;
        });
        return `| ${b.join(' | ')} |`;
    };
    const sheader = sformat(headers);
    const buff = [title];
    buff.push(sepTop(sizes));

    buff.push(sheader);
    buff.push(sepMid(sizes));

    for (const record of records) {
        buff.push(sformat(record));
    }
    buff.push(sepBottom(sizes));

    return buff.join('\n');
};
