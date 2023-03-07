import { IBundleTracker, IBundleContext } from '@odss/common';
import { HandlerFactoryService } from '@odss/common';

import { ActiveBundleTracker, HandlersTracker } from './trackers';
import { CdiService } from './service';
import {
    ProviderHandlerFactory,
    CallbacksHandlerFactory,
    DependenciesHandlerFactory,
    ReferencesHandlerFactory,
} from './handlers';

export class Activator {
    private bundleTracker: ActiveBundleTracker;
    private handlersTracker: HandlersTracker;

    async start(ctx: IBundleContext) {
        const cdi = new CdiService();
        this.handlersTracker = new HandlersTracker(ctx, cdi);
        this.bundleTracker = new ActiveBundleTracker(ctx, cdi);
        this.handlersTracker.open();
        this.bundleTracker.open();

        await ctx.registerService(HandlerFactoryService, new DependenciesHandlerFactory());
        await ctx.registerService(HandlerFactoryService, new ReferencesHandlerFactory());
        await ctx.registerService(HandlerFactoryService, new ProviderHandlerFactory());
        await ctx.registerService(HandlerFactoryService, new CallbacksHandlerFactory());
    }
    stop() {
        if (this.handlersTracker) {
            this.handlersTracker.open();
            this.handlersTracker = null;
        }

        if (this.bundleTracker) {
            this.bundleTracker.close();
            this.bundleTracker = null;
        }
    }
}
