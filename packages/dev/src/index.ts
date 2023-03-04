import {
    IBundleContext,
} from '@odss/common';

import { ActiveBundleTracker } from './trackers';

export class Activator {
    private bundleTracer: ActiveBundleTracker | null = null;

    async start(ctx: IBundleContext): Promise<void> {
        this.bundleTracer = new ActiveBundleTracker(ctx);
        await this.bundleTracer.open();
    }
    async stop(): Promise<void> {
        if (this.bundleTracer) {
            await this.bundleTracer.close();
        }
    }
}
