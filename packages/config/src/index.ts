import { IBundleContext, ConfigAdminService } from "@odss/common";

import { ConfigAdmin } from './admin';
import { ConfigManagedFactoryTracker, ConfigManagedTracker, ConfigStorageTracker } from './trackers';

export class Activator {
    start(ctx: IBundleContext) {
        const admin = new ConfigAdmin();
        const t1 = new ConfigManagedFactoryTracker(ctx, admin);
        const t2 = new ConfigManagedTracker(ctx, admin);
        const t3 = new ConfigStorageTracker(ctx, admin);
        t1.open();
        t2.open();
        t3.open();
        ctx.registerService(ConfigAdminService, admin);
    }
    stop() {

    }
}