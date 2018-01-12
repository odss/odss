import { Events } from './consts';
// type Trackable = IBundle | IServiceReference;
class Tracked {
    constructor() {
        this._tracked = new Set();
    }
    track(item) {
        if (this._tracked.has(item)) {
            this.modified(item);
        }
        else {
            this._tracked.add(item);
            this.adding(item);
        }
    }
    untrack(item) {
        if (this._tracked.has(item)) {
            this._tracked.delete(item);
            this.removed(item);
        }
    }
    close() {
        let items = Array.from(this._tracked);
        for (let item of items) {
            this.untrack(item);
        }
    }
    removed(item) {
        throw new Error(`Not implemented Tracked::removed(${item})`);
    }
    adding(item) {
        throw new Error(`Not implemented Tracked::adding(${item})`);
    }
    modified(item) {
        throw new Error(`Not implemented Tracked::modified(${item})`);
    }
    size() {
        return this._tracked.size;
    }
    getItems() {
        return Array.from(this._tracked);
    }
}
/**
 * @type {tracker.ServiceTracked}
 */
class ServiceTracked extends Tracked {
    constructor(tracker) {
        super();
        this.tracker = tracker;
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
    removed(reference) {
        this.tracker.removedService(reference);
    }
    adding(reference) {
        this.tracker.addingService(reference);
    }
    modified(reference) {
        this.tracker.modifiedService(reference);
    }
}
/**
 * @type {tracker.ServiceTracker}
 */
export class ServiceTracker {
    constructor(ctx, filter, listener) {
        if (!ctx) {
            throw new Error('Not set bundle context');
        }
        if (!filter) {
            throw new Error('Not set filter');
        }
        this._ctx = ctx;
        this._filter = filter;
        this._listener = listener;
        this._tracked = null;
    }
    open() {
        if (this._tracked === null) {
            this._tracked = new ServiceTracked(this);
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
    /**
     *
     * @param {service.Reference} reference
     */
    addingService(reference) {
        if (this._listener) {
            this._listener.addingService(reference);
        }
    }
    /**
     *
     * @param {service.Reference} reference
     */
    modifiedService(reference) {
        if (this._listener) {
            this._listener.modifiedService(reference);
        }
    }
    /**
     *
     * @param {service.Reference} reference
     */
    removedService(reference) {
        if (this._listener) {
            this._listener.removedService(reference);
        }
        this._ctx.ungetService(reference);
    }
    get size() {
        return this._tracked !== null ? this._tracked.size() : 0;
    }
    get reference() {
        if (this._tracked !== null) {
            let items = this._tracked.getItems();
            if (items.length) {
                return items[0];
            }
        }
        return null;
    }
    references() {
        return this._tracked !== null ? this._tracked.getItems() : [];
    }
    get service() {
        let ref = this.reference;
        return ref === null ? null : this._ctx.getService(ref);
    }
    services() {
        let buff = [];
        let refs = this.references();
        for (let i = 0, j = refs.length; i < j; i++) {
            buff.push(this._ctx.getService(refs[i]));
        }
        return buff;
    }
}
/**
 * @type {tracker.BundleTracked}
 */
class BundleTracked extends Tracked {
    constructor(mask, listener) {
        super();
        this.listener = listener || null;
        this.mask = mask;
    }
    bundleEvent(event) {
        if (event.bundle.state & this.mask) {
            this.track(event.bundle);
        }
        else {
            this.untrack(event.bundle);
        }
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
    get size() {
        return this._tracked !== null ? this._tracked.size() : 0;
    }
    bundles() {
        return this._tracked !== null ? this._tracked.getItems() : [];
    }
    addingBundle(bundle) {
    }
    modifiedBundle(bundle) {
    }
    removedBundle(bundle) {
    }
}
