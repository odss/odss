import { Bundles, IBundleTracker, IBundleContext } from '@odss/common';
import { BundleRegister } from './bundle-register';

export class Activator {

    private tracker: IBundleTracker;
    private bundleRegister: BundleRegister;

    start(ctx: IBundleContext) {
        this.bundleRegister = new BundleRegister(ctx);
        this.tracker = ctx.bundleTracker(Bundles.ACTIVE, this.bundleRegister).open();
    }
    stop(ctx: IBundleContext) {
        if (this.bundleRegister) {
            this.bundleRegister.close();
        }
        if (this.tracker) {
            this.tracker.close();
            this.tracker = null;
        }
    }
}
