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

export class ServiceTracker<S = any> implements IServiceTrackerListener<S>, IServiceTrackerCustomizer<S> {
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
    open(): this {
        if (!this._tracked) {
            this._tracked = new ServiceTracked(this);
            this._ctx.addServiceListener(this._tracked, this._name, this._filter);
            const refs = this._ctx.getServiceReferences(this._name, this._filter);
            for (let i = 0, j = refs.length; i < j; i++) {
                this._tracked.track(refs[i]);
            }
        }
        return this;
    }
    close(): this {
        if (this._tracked) {
            this._ctx.removeServiceListener(this._tracked);
            this._tracked.close();
            this._tracked = undefined;
        }
        return this;
    }
    adding(reference: IServiceReference): S {
        const service = this._ctx.getService<S>(reference);
        if (this._listener) {
            if (typeof this._listener === 'function') {
                this._listenerDispose = toDisposable(this._listener(service, reference));
            } else {
                this._listener.addingService(service, reference);
            }
        }
        return service;
    }
    modified(reference: IServiceReference, service: S): void {
        if (this._listener && typeof this._listener !== 'function') {
            this._listener.modifiedService(service, reference);
        }
    }
    removed(reference: IServiceReference, service: S): S {
        if (this._listener) {
            if (typeof this._listener === 'function') {
                if (this._listenerDispose) {
                    this._listenerDispose.dispose();
                }
            } else {
                this._listener.removedService(service, reference);
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
    addingService(service: S, reference: IServiceReference): void {
        // do nothing
    }
    modifiedService(service: S, reference: IServiceReference): void {
        // do nothing
    }
    removedService(service: S, reference: IServiceReference): void {
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
    open(): this {
        if (!this._tracked) {
            this._tracked = new BundleTracked(this._mask, this._listener);
            this._ctx.addBundleListener(this._tracked);
            const bundles = this._ctx.getBundles();
            for (let i = 0, j = bundles.length; i < j; i++) {
                if (bundles[i].state && this._mask) {
                    this._tracked.track(bundles[i]);
                }
            }
        }
        return this;
    }
    close(): this {
        if (this._tracked) {
            this._ctx.removeBundleListener(this._tracked);
            this._tracked.close();
            this._tracked = undefined;
        }
        return this;
    }
    size(): number {
        return this._tracked ? this._tracked.size() : 0;
    }
    bundles(): IBundle[] {
        return this._tracked ? this._tracked.getBundles() : [];
    }

    addingBundle(bundle: IBundle) {
        //do nothing
    }
    modifiedBundle(bundle: IBundle) {
        //do nothing
    }
    removedBundle(bundle: IBundle) {
        //do nothing
    }
}

class ServiceTracked<TService> implements IServiceListener {
    private tracked: Map<IServiceReference, TService> = new Map();

    constructor(private customizer: IServiceTrackerCustomizer<TService>) {}
    serviceEvent(event: ServiceEvent) {
        switch (event.type) {
            case Events.REGISTERED:
            case Events.MODIFIED:
                this.track(event.reference);
                break;
            case Events.UNREGISTERED:
                this.untrack(event.reference);
                break;
        }
    }
    track(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference) as TService;
            this.modified(reference, service);
        } else {
            const service = this.adding(reference);
            if (service) {
                this.tracked.set(reference, service);
            }
        }
    }
    untrack(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference) as TService;
            this.tracked.delete(reference);
            this.removed(reference, service);
        }
    }
    close() {
        const items = Array.from(this.tracked.keys());
        for (const item of items) {
            this.untrack(item);
        }
    }
    adding(reference: IServiceReference) {
        return this.customizer.adding(reference);
    }
    modified(reference: IServiceReference, service: TService): void {
        this.customizer.modified(reference, service);
    }
    removed(reference: IServiceReference, service: TService): void {
        this.customizer.removed(reference, service);
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

    constructor(
        private mask: number,
        private listener: IBundleTrackerListener
    ) {
    }
    bundleEvent(event: BundleEvent) {
        if (event.bundle.state & this.mask) {
            this.track(event.bundle);
        } else {
            this.untrack(event.bundle);
        }
    }
    track(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            this.listener.modifiedBundle(bundle);
        } else {
            this.bundles.add(bundle);
            this.listener.addingBundle(bundle);
        }
    }
    untrack(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            this.bundles.delete(bundle);
            this.listener.removedBundle(bundle);
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