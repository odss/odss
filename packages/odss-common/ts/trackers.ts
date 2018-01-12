import {Events} from './consts';
import {
    IBundleContext, 
    IServiceReference, 
    IBundle, 
    IServiceListener, 
    IServiceTrackerListener,
    IBundleTrackerListener
} from './interfaces';
import {ServiceEvent, BundleEvent} from './events';


// type Trackable = IBundle | IServiceReference;

class Tracked<T> {

    private _tracked: Set<T>;
    
    constructor() {
        this._tracked = new Set<T>();
    }

    track(item: T) {
        if (this._tracked.has(item)) {
            this.modified(item);
        } else {
            this._tracked.add(item);
            this.adding(item);
        }
    }
    
    untrack(item: T) {
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
    removed(item: T) {
        throw new Error(`Not implemented Tracked::removed(${item})`);
    }
    adding(item: T) {
        throw new Error(`Not implemented Tracked::adding(${item})`);
    }
    modified(item: T) {
        throw new Error(`Not implemented Tracked::modified(${item})`);
    }
    size(): number {
        return this._tracked.size;
    }
    getItems(): Array<T>{
        return Array.from(this._tracked);
    }
}

/**
 * @type {tracker.ServiceTracked}
 */
class ServiceTracked extends Tracked<IServiceReference> implements IServiceListener{
    private tracker: ServiceTracker;

    constructor(tracker: ServiceTracker) {
        super();
        this.tracker = tracker;
    }
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
    removed(reference: IServiceReference) {
        this.tracker.removedService(reference);
    }
    adding(reference: IServiceReference) {
        this.tracker.addingService(reference);
    }
    modified(reference: IServiceReference) {
        this.tracker.modifiedService(reference);
    }
}

/**
 * @type {tracker.ServiceTracker}
 */
export class ServiceTracker {
    private _ctx: IBundleContext;
    private _filter: any;
    private _listener: IServiceTrackerListener;
    private _tracked: ServiceTracked;

    constructor(ctx: IBundleContext, filter: any, listener: IServiceTrackerListener) {
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
    addingService(reference: IServiceReference) {
            if (this._listener) {
                this._listener.addingService(reference);
            }
        }
        /**
         *
         * @param {service.Reference} reference
         */
    modifiedService(reference: IServiceReference) {
            if (this._listener) {
                this._listener.modifiedService(reference);
            }
        }
        /**
         *
         * @param {service.Reference} reference
         */
    removedService(reference: IServiceReference) {
        if (this._listener) {
            this._listener.removedService(reference);
        }
        this._ctx.ungetService(reference);
    }
    get size(): number {
        return this._tracked !== null ? this._tracked.size() : 0;
    }
    get reference(): IServiceReference {
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
class BundleTracked extends Tracked<IBundle> {
    private listener: IBundleTrackerListener;
    private mask: number;
    constructor(mask: number, listener: IBundleTrackerListener) {
        super();
        this.listener = listener || null;
        this.mask = mask;
    }
    bundleEvent(event: BundleEvent) {
        if (event.bundle.state & this.mask) {
            this.track(event.bundle);
        } else {
            this.untrack(event.bundle);
        }
    }
    removed(bundle: IBundle) {
        if (this.listener !== null) {
            this.listener.removedBundle(bundle);
        }
    }
    adding(bundle: IBundle) {
        if (this.listener !== null) {
            this.listener.addingBundle(bundle);
        }
    }
    modified(bundle: IBundle) {
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
    private _ctx: IBundleContext;
    private mask: number;
    private _listener: IBundleTrackerListener;
    private _tracked: BundleTracked;

    constructor(ctx: IBundleContext, mask: number, listener: IBundleTrackerListener=null) {
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

    addingBundle(bundle: IBundle) {
    }

    modifiedBundle(bundle: IBundle) {
    }

    removedBundle(bundle: IBundle) {
    }
}
