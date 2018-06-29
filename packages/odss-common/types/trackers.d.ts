import { IBundleContext, IServiceReference, IBundle, IServiceTrackerListener, IServiceTrackerCustomizer, IBundleTrackerListener } from './interfaces';
export declare class ServiceTracker implements IServiceTrackerCustomizer {
    private _ctx;
    private _filter;
    private _listener;
    private _tracked;
    constructor(ctx: IBundleContext, filter: any, listener?: IServiceTrackerListener);
    open(): this;
    close(): this;
    adding(reference: IServiceReference): Object;
    modified(reference: IServiceReference, service: Object): void;
    removed(reference: IServiceReference, service: Object): void;
    size(): number;
    getReference(): IServiceReference;
    getReferences(): IServiceReference[];
    getService(): Object;
    getServices(): Object[];
    _extendCustomizer(customizer: any): void;
}
/**
 * @type {tracker.BundleTracker}
 * @constructor
 */
export declare class BundleTracker {
    private _ctx;
    private mask;
    private _listener;
    private _tracked;
    constructor(ctx: IBundleContext, mask: number, listener?: IBundleTrackerListener);
    open(): this;
    close(): this;
    size(): number;
    bundles(): IBundle[];
    addingBundle(bundle: IBundle): void;
    modifiedBundle(bundle: IBundle): void;
    removedBundle(bundle: IBundle): void;
}
