import { IBundle, IBundleContext, ServiceTracker, BundleTracker, Bundles } from '@odss/common';
import { hasFactoryContext, HandlerFactoryService, IHandlerFactory } from '@odss/common';

export class HandlersTracker extends ServiceTracker<IHandlerFactory> {
    constructor(ctx: IBundleContext, private cdi: any) {
        super(ctx, HandlerFactoryService);
    }

    async addingService(handler: IHandlerFactory): Promise<void> {
        await this.cdi.registerHandler(handler);
    }
    // modifiedService(): void {}

    async removedService(handler: IHandlerFactory): Promise<void> {
        await this.cdi.unregisterHandler(handler);
    }
}

export class ActiveBundleTracker extends BundleTracker {
    constructor(ctx: IBundleContext, private cdi: any) {
        super(ctx, Bundles.ACTIVE);
    }
    async addingBundle(bundle: IBundle): Promise<void> {
        const targets = Object.values(bundle.module)
            .filter(entry => typeof entry === 'function')
            .filter(hasFactoryContext);
        if (targets.length) {
            await this.cdi.addBundleComponents(bundle, targets);
        }
    }
    // modifiedBundle(bundle: IBundle): void {}
    async removedBundle(bundle: IBundle): Promise<void> {
        await this.cdi.removeBundleComponents(bundle);
    }
}
