import {
    IBundle,
    IBundleContext,
    ServiceTracker,
    BundleTracker,
    Bundles,
} from '@odss/common';
import { hasFactoryContext, IHandlerFactoryService, IHandlerFactory } from '@odss/cdi-common';

export class HandlersTracker extends ServiceTracker<IHandlerFactory> {
    constructor(ctx: IBundleContext, private cdi: any) {
        super(ctx, IHandlerFactoryService);
    }

    addingService(handler: IHandlerFactory): void {
        this.cdi.registerHandler(handler);
    }
    // modifiedService(): void {}

    removedService(handler: IHandlerFactory): void {
        this.cdi.unregisterHandler(handler);
    }
}

export class ActiveBundleTracker extends BundleTracker {
    constructor(ctx: IBundleContext, private cdi: any) {
        super(ctx, Bundles.ACTIVE);
    }
    addingBundle(bundle: IBundle): void {
        const targets = Object.values(bundle.module)
            .filter(entry => typeof entry === 'function')
            .filter(hasFactoryContext);
        if (targets.length) {
            this.cdi.addBundleComponents(bundle, targets);
        }
    }
    // modifiedBundle(bundle: IBundle): void {}
    removedBundle(bundle: IBundle): void {
        this.cdi.removeBundleComponents(bundle);
    }
}
