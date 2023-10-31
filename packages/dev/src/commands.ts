import { IBundleContext } from '@odss/common';
import { Command, Commands } from '@odss/shell';

import { IStorage } from './storage';
import { CONFIG_DEFAULT_NAME } from './consts';
import { Config } from './types';

@Commands('dev')
export class DevCommands {
    private initBundles: string[];

    constructor(
        private ctx: IBundleContext,
        private config: any 
    ) {
        this.initBundles = this.getCurrentBundles();
        console.log({ bundles: this.initBundles })
    }

    private getCurrentBundles(): string[] {
        return this.ctx.getBundles().map(bundle => bundle.name);
    }

    private getNewBundles(): string[] {
        const current = this.ctx.getBundles().map(bundle => bundle.name);
        return current.filter(name => !this.initBundles.includes(name));
    }

    @Command({
        id: 'apps/current',
        description: 'Show current app',
    })
    async current() {
        return this.config.getCurrentAppName();
    }

    @Command({
        id: 'apps/list',
        description: 'Show available configs',
    })
    async list() {
        return this.config.getAvailableApps();
    }

    @Command({
        id: 'apps/use',
        description: 'Show selected configs',
    })
    async use(args: string[]) {
        const name = args[0];
        const { prev, current }= await this.config.selectApp(name);
        if (prev?.bundles) {
            for (const name of prev.bundles) {
                const bundle = this.ctx.getBundleByName(name);
                await this.ctx.getFramework().uninstallBundle(bundle);
            }
        }
        if (current?.bundles) {
            for (const bundle of current.bundles) {
                await this.ctx.installBundle(bundle, true);
            }
        } 
    }

    @Command({
        id: 'save',
        description: 'Save current config',
    })
    async save(args) {
        const name = args.length === 1 ? args[0] : CONFIG_DEFAULT_NAME;
        const bundles = this.getNewBundles();
        return this.config.saveApp(name, { bundles });
    }
}
