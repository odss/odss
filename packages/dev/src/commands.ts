import { IBundleContext } from '@odss/common';
import { Command, Commands } from '@odss/shell';

import { ConfigController } from './config';

@Commands('apps')
export class DevCommands {
    private initBundles: string[];

    constructor(
        private ctx: IBundleContext,
        private config: ConfigController
    ) {
        this.initBundles = this.getCurrentBundles();
        console.log({ bundles: this.initBundles })
    }

    private getCurrentBundles(): string[] {
        return this.ctx.getBundles().map(bundle => bundle.name);
    }

    @Command({
        id: 'current',
        description: 'Show current app',
    })
    async current() {
        return { 
            name: await this.config.getCurrentAppName(),
            config: await this.config.getCurrentApp(),
        };
    }

    @Command({
        id: 'list',
        description: 'Show available configs',
    })
    async list() {
        return this.config.getAvailableApps();
    }

    @Command({
        id: 'use',
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
        id: 'add',
        description: 'Add current config',
    })
    async add(args: string[]) {
        const name = args[0];
        const app = await this.config.getCurrentApp();
        app.bundles.push(name);
        this.config.updateCurrentApp(app)
    }
}
