import {Events} from './consts';
import {
    IBundleContext,
    IServiceReference,
    IBundle,
    IServiceListener,
    IServiceTrackerListener,
    IServiceTrackerCustomizer,
    IBundleTrackerListener
} from './interfaces';
import {ServiceEvent, BundleEvent} from './events';


class ServiceTracked implements IServiceListener{

    private customizer: IServiceTrackerCustomizer;
    private tracked: Map<IServiceReference, Object>;

    constructor(customizer: IServiceTrackerCustomizer) {
        this.tracked = new Map<IServiceReference, Object>();
        this.customizer = customizer;
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
    track(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference);
            this.modified(reference, service);
        } else {
            const service = this.adding(reference);
            if(service){
                this.tracked.set(reference, service);
            }
        }
    }
    untrack(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference)
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
    adding(reference: IServiceReference) {
        return this.customizer.adding(reference);
    }
    modified(reference: IServiceReference, service: any): void {
        this.customizer.modified(reference, service);
    }
    removed(reference: IServiceReference, service: any): void {
        this.customizer.removed(reference, service);
    }
    size(): number {
        return this.tracked.size;
    }
    getServices(): Array<any>{
        return Array.from(this.tracked.values());
    }
    getReferences(): Array<IServiceReference> {
        return Array.from(this.tracked.keys());
    }

}

export class ServiceTracker implements IServiceTrackerCustomizer{
    private _ctx: IBundleContext;
    private _name: any;
    private _filter?: any;
    private _listener?: IServiceTrackerListener;
    private _tracked?: ServiceTracked;

    constructor(
        ctx: IBundleContext,
        name: any,
        listener?: IServiceTrackerListener,
        filter?: string,
    ) {
        if (!ctx) {
            throw new Error('Not set bundle context');
        }
        if (!name) {
            throw new Error('Not set name');
        }
        this._ctx = ctx;
        this._name = name;
        this._filter = filter;
        this._listener = listener;
    }
    open() {
        if (!this._tracked) {
            this._tracked = new ServiceTracked(this);
            this._ctx.on.service.add(this._tracked, this._name, this._filter);
            let refs = this._ctx.getServiceReferences(this._name, this._filter);
            for (let i = 0, j = refs.length; i < j; i++) {
                this._tracked.track(refs[i]);
            }
        }
        return this;
    }
    close() {
        if (this._tracked) {
            this._ctx.on.service.remove(this._tracked);
            this._tracked.close();
            this._tracked = undefined;
        }
        return this;
    }
    adding(reference: IServiceReference): Object {
        const service = this._ctx.getService(reference);
        if(this._listener && this._listener.addingService){
            this._listener.addingService(reference, service);
        }
        return service;
    }
    modified(reference: IServiceReference, service: Object) {
        if(this._listener && this._listener.modifiedService){
            this._listener.modifiedService(reference, service);
        }
    }
    removed(reference: IServiceReference, service: Object) {
        if(this._listener && this._listener.removedService){
            this._listener.removedService(reference, service);
        }
        this._ctx.ungetService(reference);
    }
    size(): number {
        return this._tracked ? this._tracked.size() : 0;
    }
    getReference(): IServiceReference {
        return this.getReferences()[0];
    }
    getReferences() {
        return this._tracked ? this._tracked.getReferences() : [];
    }
    getService() {
        return this.getServices()[0];
    }
    getServices() {
        return this._tracked ? this._tracked.getServices() : [];
    }
    _extendCustomizer(customizer){
        if(customizer){

        }
    }
}


class BundleTracked{
    private listener: IBundleTrackerListener|null;
    private mask: number;
    private bundles: Set<IBundle>;

    constructor(mask: number, listener: IBundleTrackerListener|null = null) {
        this.listener = listener;
        this.mask = mask;
        this.bundles = new Set<IBundle>();
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
            this.modified(bundle);
        } else {
            this.bundles.add(bundle);
            this.adding(bundle);
        }
    }
    untrack(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            this.bundles.delete(bundle);
            this.removed(bundle);
        }
    }
    size(){
        return this.bundles.size;
    }
    close(){
        this.bundles.clear();
    }
    getBundles(): Array<IBundle>{
        return Array.from(this.bundles);
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
    private _listener?: IBundleTrackerListener;
    private _tracked?: BundleTracked;

    constructor(ctx: IBundleContext, mask: number, listener: IBundleTrackerListener) {
        this._ctx = ctx;
        if (!mask) {
            throw new Error('Not set mask for bundles');
        }
        this.mask = mask;
        this._listener = listener;
    }
    open() {
        if (!this._tracked) {
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
        if (this._tracked) {
            this._ctx.on.bundle.remove(this._tracked);
            this._tracked.close();
            this._tracked = undefined;
        }
        return this;
    }
    size() {
        return this._tracked ? this._tracked.size() : 0;
    }
    bundles() {
        return this._tracked ? this._tracked.getBundles() : [];
    }
    addingBundle(bundle: IBundle) {
    }
    modifiedBundle(bundle: IBundle) {
    }
    removedBundle(bundle: IBundle) {
    }
}
