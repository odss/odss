import { IBundleContext, IServiceReference, IBundle, IServiceTrackerListener, IServiceTrackerCustomizer, IBundleTrackerListener } from './interfaces';
export declare class ServiceTracker implements IServiceTrackerCustomizer {
    private _ctx;
    private _name;
    private _filter?;
    private _listener?;
    private _tracked?;
    constructor(ctx: IBundleContext, name: any, listener?: IServiceTrackerListener, filter?: string);
    open(): this;
    close(): this;
    adding(reference: IServiceReference): Object;
    modified(reference: IServiceReference, service: Object): void;
    removed(reference: IServiceReference, service: Object): void;
    size(): number;
    getReference(): IServiceReference;
    getReferences(): IServiceReference[];
    getService(): any;
    getServices(): any[];
    _extendCustomizer(customizer: any): void;
}
/**
 * @type {tracker.BundleTracker}
 * @constructor
 */
export declare class BundleTracker {
    private _ctx;
    private mask;
    private _listener?;
    private _tracked?;
    constructor(ctx: IBundleContext, mask: number, listener: IBundleTrackerListener);
    open(): this;
    close(): this;
    size(): number;
    bundles(): IBundle[];
    addingBundle(bundle: IBundle): void;
    modifiedBundle(bundle: IBundle): void;
    removedBundle(bundle: IBundle): void;
}
