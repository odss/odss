import { Events } from './consts';
import {
    IBundleContext,
    IServiceReference,
    IBundle,
    IBundleTracker,
    IServiceListener,
    IServiceTrackerListener,
    IServiceTrackerCustomizer,
    IServiceTrackerListenerType,
    IBundleTrackerListener,
    IDisposable,
    NamedServiceType,
    FilterType,
} from './types/core';
import { toDisposable } from './utils';
import { ServiceEvent, BundleEvent } from './events';

export class ServiceTracker<S = any>
    implements IServiceTrackerListener<S>, IServiceTrackerCustomizer<S>
{
    private _tracked?: ServiceTracked<S>;
    private _listenerDispose?: IDisposable;

    constructor(
        private _ctx: IBundleContext,
        private _name: NamedServiceType,
        private _listener: IServiceTrackerListenerType<S> = null,
        private _filter: FilterType = ''
    ) {
        if (!_name) {
            throw new TypeError('Empty name');
        }
        if (this._listener === null) {
            this._listener = this;
        }
    }
    async open(): Promise<this> {
        if (!this._tracked) {
            this._tracked = new ServiceTracked(this);
            this._ctx.addServiceListener(this._tracked, this._name, this._filter);
            const refs = this._ctx.getServiceReferences(this._name, this._filter);
            for (let i = 0, j = refs.length; i < j; i++) {
                await this._tracked.track(refs[i]);
            }
        }
        return this;
    }
    async close(): Promise<this> {
        if (this._tracked) {
            this._ctx.removeServiceListener(this._tracked);
            await this._tracked.close();
            this._tracked = undefined;
        }
        return this;
    }
    async adding(reference: IServiceReference): Promise<S> {
        const service = this._ctx.getService<S>(reference);
        if (this._listener) {
            if (typeof this._listener === 'function') {
                this._listenerDispose = toDisposable(await this._listener(service, reference));
            } else {
                await this._listener.addingService(service, reference);
            }
        }
        return service;
    }
    async modified(reference: IServiceReference, service: S): Promise<void> {
        if (this._listener && typeof this._listener !== 'function') {
            await this._listener.modifiedService(service, reference);
        }
    }
    async removed(reference: IServiceReference, service: S): Promise<S> {
        if (this._listener) {
            if (typeof this._listener === 'function') {
                if (this._listenerDispose) {
                    this._listenerDispose.dispose();
                }
            } else {
                await this._listener.removedService(service, reference);
            }
        }
        this._ctx.ungetService(reference);
        return service;
    }
    size(): number {
        return this._tracked ? this._tracked.size() : 0;
    }
    getReference(): IServiceReference {
        return this.getReferences()[0];
    }
    getReferences(): IServiceReference[] {
        return this._tracked ? this._tracked.getReferences() : [];
    }
    getService(): S {
        return this.getServices()[0];
    }
    getServices(): S[] {
        return this._tracked ? this._tracked.getServices() : [];
    }
    async addingService(service: S, reference: IServiceReference): Promise<void> {
        // do nothing
    }
    async modifiedService(service: S, reference: IServiceReference): Promise<void> {
        // do nothing
    }
    async removedService(service: S, reference: IServiceReference): Promise<void> {
        // do nothing
    }
}

export class BundleTracker implements IBundleTracker, IBundleTrackerListener {
    private _tracked?: BundleTracked;

    constructor(
        private _ctx: IBundleContext,
        private _mask: number,
        private _listener: IBundleTrackerListener = null
    ) {
        if (!_mask) {
            throw new Error('Not set mask for bundles');
        }
        if (this._listener === null) {
            this._listener = this;
        }
    }
    async open(): Promise<void> {
        if (!this._tracked) {
            this._tracked = new BundleTracked(this._mask, this._listener);
            this._ctx.addBundleListener(this._tracked);
            const bundles = this._ctx.getBundles();
            for (let i = 0, j = bundles.length; i < j; i++) {
                if (bundles[i].state && this._mask) {
                    await this._tracked.track(bundles[i]);
                }
            }
        }
    }
    async close(): Promise<void> {
        if (this._tracked) {
            this._ctx.removeBundleListener(this._tracked);
            await this._tracked.close();
            this._tracked = undefined;
        }
    }
    size(): number {
        return this._tracked ? this._tracked.size() : 0;
    }
    bundles(): IBundle[] {
        return this._tracked ? this._tracked.getBundles() : [];
    }

    async addingBundle(bundle: IBundle): Promise<void> {
        //do nothing
    }
    async modifiedBundle(bundle: IBundle): Promise<void> {
        //do nothing
    }
    async removedBundle(bundle: IBundle): Promise<void> {
        //do nothing
    }
}

class ServiceTracked<TService> implements IServiceListener {
    private tracked: Map<IServiceReference, TService> = new Map();

    constructor(private customizer: IServiceTrackerCustomizer<TService>) {}
    async serviceEvent(event: ServiceEvent) {
        switch (event.type) {
            case Events.REGISTERED:
            case Events.MODIFIED:
                await this.track(event.reference);
                break;
            case Events.UNREGISTERED:
                await this.untrack(event.reference);
                break;
        }
    }
    async track(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference) as TService;
            await this.modified(reference, service);
        } else {
            const service = await this.adding(reference);
            if (service) {
                this.tracked.set(reference, service);
            }
        }
    }
    async untrack(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference) as TService;
            this.tracked.delete(reference);
            await this.removed(reference, service);
        }
    }
    async close() {
        const items = Array.from(this.tracked.keys());
        for (const item of items) {
            await this.untrack(item);
        }
    }
    async adding(reference: IServiceReference) {
        return this.customizer.adding(reference);
    }
    async modified(reference: IServiceReference, service: TService) {
        await this.customizer.modified(reference, service);
    }
    async removed(reference: IServiceReference, service: TService) {
        await this.customizer.removed(reference, service);
    }
    size(): number {
        return this.tracked.size;
    }
    getServices(): Array<TService> {
        return Array.from(this.tracked.values());
    }
    getReferences(): Array<IServiceReference> {
        return Array.from(this.tracked.keys());
    }
}
class BundleTracked {
    private bundles: Set<IBundle> = new Set();

    constructor(private mask: number, private listener: IBundleTrackerListener) {}
    async bundleEvent(event: BundleEvent): Promise<void> {
        if (event.bundle.state & this.mask) {
            await this.track(event.bundle);
        } else {
            await this.untrack(event.bundle);
        }
    }
    async track(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            await this.listener.modifiedBundle(bundle);
        } else {
            this.bundles.add(bundle);
            await this.listener.addingBundle(bundle);
        }
    }
    async untrack(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            this.bundles.delete(bundle);
            await this.listener.removedBundle(bundle);
        }
    }
    size() {
        return this.bundles.size;
    }
    close() {
        this.bundles.clear();
    }
    getBundles(): Array<IBundle> {
        return Array.from(this.bundles);
    }
}
