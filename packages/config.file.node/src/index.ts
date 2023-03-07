import path from 'path';
import { IBundleContext, ConfigStorageService } from '@odss/common';

import { JsonConfigStorage } from './json';

export class Activator {
    async start(ctx: IBundleContext) {
        const dir = ctx.getProperty('config_dir', path.join(process.cwd(), 'config'));
        ctx.registerService(ConfigStorageService, new JsonConfigStorage(dir));
    }
    async stop(ctx: IBundleContext) {

    }
}