import { Events } from './consts';
class ServiceTracked {
    constructor(customizer) {
        this.tracked = new Map();
        this.customizer = customizer;
    }
    serviceEvent(event) {
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
    removed(reference, service) {
        this.customizer.removedService(reference, service);
    }
    adding(reference) {
        return this.customizer.addingService(reference);
    }
    modified(reference, service) {
        this.customizer.modifiedService(reference, service);
    }
    track(reference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference);
            this.modified(reference, service);
        }
        else {
            const service = this.adding(reference);
            if (service) {
                this.tracked.set(reference, service);
            }
        }
    }
    untrack(reference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference);
            this.tracked.delete(reference);
            this.removed(reference, service);
        }
    }
    close() {
        let items = Array.from(this.tracked.keys());
        for (let item of items) {
            this.untrack(item);
        }
    }
    size() {
        return this.tracked.size;
    }
    getServices() {
        return Array.from(this.tracked.values());
    }
    getReferences() {
        return Array.from(this.tracked.keys());
    }
}
export class ServiceTracker {
    constructor(ctx, filter, customizer = null) {
        if (!ctx) {
            throw new Error('Not set bundle context');
        }
        if (!filter) {
            throw new Error('Not set filter');
        }
        this._ctx = ctx;
        this._filter = filter;
        this._customizer = customizer || this;
        this._tracked = null;
    }
    open() {
        if (this._tracked === null) {
            this._tracked = new ServiceTracked(this._customizer);
            this._ctx.on.service.add(this._tracked, this._filter);
            let refs = this._ctx.getServiceReferences(this._filter);
            for (let i = 0, j = refs.length; i < j; i++) {
                this._tracked.track(refs[i]);
            }
        }
        return this;
    }
    close() {
        if (this._tracked !== null) {
            this._ctx.on.service.remove(this._tracked);
            this._tracked.close();
            this._tracked = null;
        }
        return this;
    }
    addingService(reference) {
        const service = this._ctx.getService(reference);
        this.onAddingService(reference, service);
        return service;
    }
    modifiedService(reference, service) {
        this.onModifiedService(reference, service);
    }
    removedService(reference, service) {
        this.onRemovedService(reference, service);
        this._ctx.ungetService(reference);
    }
    onAddingService(reference, service) {
    }
    onModifiedService(reference, service) {
    }
    onRemovedService(reference, service) {
    }
    size() {
        return this._tracked !== null ? this._tracked.size() : 0;
    }
    getReference() {
        return this.getReferences()[0];
    }
    getReferences() {
        return this._tracked !== null ? this._tracked.getReferences() : [];
    }
    getService() {
        return this.getServices()[0];
    }
    getServices() {
        return this._tracked !== null ? this._tracked.getServices() : [];
    }
}
class BundleTracked {
    constructor(mask, listener = null) {
        this.listener = listener;
        this.mask = mask;
        this.bundles = new Set();
    }
    bundleEvent(event) {
        if (event.bundle.state & this.mask) {
            this.track(event.bundle);
        }
        else {
            this.untrack(event.bundle);
        }
    }
    track(bundle) {
        if (this.bundles.has(bundle)) {
            this.modified(bundle);
        }
        else {
            this.bundles.add(bundle);
            this.adding(bundle);
        }
    }
    untrack(bundle) {
        if (this.bundles.has(bundle)) {
            this.bundles.delete(bundle);
            this.removed(bundle);
        }
    }
    size() {
        return this.bundles.size;
    }
    close() {
        this.bundles.clear();
    }
    getBundles() {
        return Array.from(this.bundles);
    }
    removed(bundle) {
        if (this.listener !== null) {
            this.listener.removedBundle(bundle);
        }
    }
    adding(bundle) {
        if (this.listener !== null) {
            this.listener.addingBundle(bundle);
        }
    }
    modified(bundle) {
        if (this.listener !== null) {
            this.listener.modifiedBundle(bundle);
        }
    }
}
/**
 * @type {tracker.BundleTracker}
 * @constructor
 */
export class BundleTracker {
    constructor(ctx, mask, listener = null) {
        this._ctx = ctx;
        if (!mask) {
            throw new Error('Not set mask for bundles');
        }
        this.mask = mask;
        this._listener = listener;
        this._tracked = null;
    }
    open() {
        if (this._tracked === null) {
            this._tracked = new BundleTracked(this.mask, this._listener || this);
            this._ctx.on.bundle.add(this._tracked);
            let bundles = this._ctx.getBundles();
            for (let i = 0, j = bundles.length; i < j; i++) {
                if (bundles[i].state && this.mask) {
                    this._tracked.track(bundles[i]);
                }
            }
        }
        return this;
    }
    close() {
        if (this._tracked !== null) {
            this._ctx.on.bundle.remove(this._tracked);
            this._tracked.close();
            this._tracked = null;
        }
        return this;
    }
    size() {
        return this._tracked !== null ? this._tracked.size() : 0;
    }
    bundles() {
        return this._tracked !== null ? this._tracked.getBundles() : [];
    }
    addingBundle(bundle) {
    }
    modifiedBundle(bundle) {
    }
    removedBundle(bundle) {
    }
}
