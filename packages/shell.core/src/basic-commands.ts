import {
    IBundleContext,
    SERVICE_RANKING,
    OBJECTCLASS,
    SERVICE_ID,
    ICommand,
    ICommandComplete,
    ICommandHandler,
} from '@odss/common';
import { Command, Commands } from '@odss/shell';
import { CommandsRegistry } from './registry';

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
    constructor(private ctx: IBundleContext, private registry: CommandsRegistry) {}

    @Command({
        id: 'properties',
        description: 'Show all properties',
    })
    properties(args: string[]) {
        return this.ctx?.getProperties() || {};
    }

    @Command({
        id: 'property',
        description: 'Show property value',
    })
    property(args: string[]) {
        return this.ctx?.getProperty(args[0], null);
    }

    @Command({
        id: 'install',
        description: 'Install bundle',
        help: 'install <bundle.name> (--autostart, -a)',
    })
    async install(args: string[]): Promise<string> {
        const autostart = args.length === 2 ? args[1] === '-a' || args[1] === '--autostart' : false;
        const bundle = await this.ctx?.installBundle(args[0], autostart);
        if (bundle) {
            return 'Bundle(id=' + bundle.id + ' name=' + bundle.name + ') installed';
        }
        return `Not found bundle id=${args[0]}`;
    }

    @Command({
        id: 'reload',
        description: 'Reload bundle',
        help: 'reload <bundle.id>',
    })
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

    @Command({
        id: 'uninstall',
        description: 'Uninstall bundle',
        help: 'uninstall <bundle.id>',
    })
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

    @Command({
        id: 'start',
        description: 'Start installed bundle',
        help: 'start <bundle.id>',
    })
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

    @Command({
        id: 'stop',
        description: 'Stop running bundle',
        help: 'stop <bundle.id>',
    })
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
        id: 'bl',
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
        id: 'bd',
        description: 'Show bundle details',
        help: 'db <bundle.id>',
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
        id: 'sl',
        description: 'List all installed services',
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
        id: 'sd',
        description: 'Show service details',
        help: 'sd <service.id>',
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
                return val.map(toValue).join(' │ ');
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
        id: 'exit',
        description: 'Shoutdown all application',
        alias: ['quit', 'shutdown'],
    })
    async exit(): Promise<string> {
        setTimeout(() => (this.ctx as any).framework.stop());
        return 'Stoping';
    }
}

export class HelpCommand implements ICommand {
    public readonly id = 'help';
    public readonly description = 'Show help for command';
    public readonly help = 'help <command>';

    public readonly alias: ['?'];

    constructor(private registry: CommandsRegistry) {}

    async execute(args: string[]): Promise<string> {
        if (args.length !== 0) {
            const result = this.registry.resolve(args.join(' '));
            if (result) {
                return `Used: ${result.name} - ${result.command.help || ''}\n${result.command.description || ''}`;
            };
            return 'Use: help <command>';
        }
        const commands = [...this.registry.getCommands().entries()].sort((a,b) => {
            if (a[0] === b[0]) return 0;
            return a[0] > b[0] ? 1 : -1;
        });
        const cmds = commands.map(([name, cmd]) => {
            if (cmd) {
                return `${name} - ${cmd.description || ''}`;
            }
            return `${name} [command]`;
        }).join('\n');

        return `Used: [command]\n\nCommands:\n${cmds}\n`;
    }

    async complete(args: string[]) {
        return [...this.registry.getCommands().keys()];
    }
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
        return `│ ${b.join(' │ ')} │`;
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
