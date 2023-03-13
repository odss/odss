import { Command, Commands } from '@odss/shell';
import { ConfigAdmin } from './admin';

@Commands('cm')
export class AdminConfigCommands {
    constructor(private admin: ConfigAdmin) {}

    @Command({
        name: 'cm:list',
        description: 'Show admin config list',
    })
    async list() {
        const configs = await this.admin.listConfigs();
        return configs.map(config => `PID=${config.getPid()}`).join('\n');
    }
    @Command({
        name: 'cm:get',
        description: 'Show admin config details',
    })
    async get(args: string[]) {
        const pid: string = args.shift();
        const config = await this.admin.getConfig(pid);
        const props = Object.entries(config.getProperties());
        return props.map(([name, value]) => `${name} = ${value}`).join('\n');
    }

    @Command({
        name: 'cm:clean',
        description: 'Clean admin config',
    })
    async clean(args: string[]) {
        const pid: string = args.shift();
        const config = await this.admin.getConfig(pid);
        await config.update({});
        return 'Removed';
    }

    @Command({
        name: 'cm:del',
        description: 'Delete admin config',
    })
    async delete(args: string[]) {
        const pid: string = args.shift();
        const config = await this.admin.getConfig(pid);
        await config.remove();
        return 'Removed';
    }

    @Command({
        name: 'cm:set',
        description: 'Set value in admin config',
    })
    async set(args: string[]) {
        const pid: string = args.shift();
        const item: string = args.shift();
        const [name, value] = item.split('=');
        const config = await this.admin.getConfig(pid);
        await config.update({ ...config.getProperties(), [name]: value });
        return 'Updated';
    }

    @Command({
        name: 'cm:factory',
        description: 'Create factory config',
    })
    async factory(args: string[]) {
        const fid: string = args.shift();
        const pid: string = args.shift();
        const config = await this.admin.createFactoryConfig(fid, pid);
        const props = Object.entries(config.getProperties());
        return props.map(([name, value]) => `${name} = ${value}`).join('\n');
    }
}
