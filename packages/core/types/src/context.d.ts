import { IBundleContext, IBundle, IServiceReference, IServiceListener, IBundleListener, IFrameworkListener, IDisposable, IServiceObject, IServiceRegistration, NamedServiceType, IServiceTrackerListenerType, FilterType, IServiceTrackerListener } from '@odss/common';
import { Framework } from './framework';
declare class ServiceObject<S> implements IServiceObject<S> {
    private _ctx;
    private _reference;
    constructor(_ctx: IBundleContext, _reference: IServiceReference);
    getService(): S;
    ungetService(): void;
    getServiceReference(): IServiceReference;
}
export default class BundleContext implements IBundleContext {
    readonly framework: Framework;
    readonly bundle: IBundle;
    readonly on: any;
    constructor(framework: Framework, bundle: IBundle);
    getProperty(name: string, def?: any): any;
    getProperties(): any;
    getBundle(): IBundle;
    getBundles(): IBundle[];
    installBundle(name: string, autoStart?: boolean): Promise<IBundle>;
    uninstallBundle(bundle: IBundle): Promise<boolean>;
    getServiceReferences(name?: any, filter?: string): IServiceReference[];
    getServiceReference(name: any, filter?: string): IServiceReference;
    getService(reference: IServiceReference): any;
    getServiceObject<S>(reference: IServiceReference): ServiceObject<S>;
    ungetService(reference: IServiceReference): void;
    registerService(name: any, service: any, properties?: any): Promise<IServiceRegistration>;
    addServiceListener(listener: IServiceListener, name: any, filter: string): IDisposable;
    addBundleListener(listener: IBundleListener): IDisposable;
    addFrameworkListener(listener: IFrameworkListener): IDisposable;
    removeServiceListener(listener: IServiceListener): void;
    removeBundleListener(listener: IBundleListener): void;
    removeFrameworkListener(listener: IFrameworkListener): void;
    createServiceTracker<S = any>(name: NamedServiceType, listener?: IServiceTrackerListenerType<S>, filter?: FilterType): IServiceTrackerListener<S>;
}
export {};
