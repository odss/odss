import {
    IBundleTracker,
    IBundleContext,
} from '@odss/common';
import {
    IHandlerFactoryService,
} from '@odss/cdi-common';

import { ActiveBundleTracker, HandlersTracker } from './trackers';
import { CdiService } from './service';
import {
    ProviderHandlerFactory,
    CallbacksHandlerFactory,
    DependenciesHandlerFactory,
    ReferencesHandlerFactory,
} from './handlers';

export class Activator {
    private bundleTracker: IBundleTracker;
    private handlersTracker: HandlersTracker;

    start(ctx: IBundleContext) {
        const cdi = new CdiService();
        this.handlersTracker = new HandlersTracker(ctx, cdi);
        this.bundleTracker = new ActiveBundleTracker(ctx, cdi);
        this.handlersTracker.open();
        this.bundleTracker.open();

        ctx.registerService(IHandlerFactoryService, new DependenciesHandlerFactory());
        ctx.registerService(IHandlerFactoryService, new ReferencesHandlerFactory());
        ctx.registerService(IHandlerFactoryService, new ProviderHandlerFactory());
        ctx.registerService(IHandlerFactoryService, new CallbacksHandlerFactory());
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
