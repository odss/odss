export type Properties = {
    [key: string]: any;
};
export interface ILoader {
    loadBundle(location: string): Promise<any>;
    unloadBundle(location: string): Promise<any>;
}

export interface IDisposable {
    dispose(): void;
}

export interface IFramework extends IBundle {
    getProperty(name: string, defaultValue: any): any;
    getProperties(): Properties;
    hasBundle(bundle: IBundle): boolean;
    getBundle(bundleId: number): IBundle;
    getBundles(): Array<IBundle>;
    installBundle(location: string, autostart: boolean): Promise<IBundle>;
    uninstallBundle(bundle: IBundle): Promise<boolean>;
    startBundle(bundle: IBundle): Promise<void>;
    stopBundle(bundle: IBundle): Promise<void>;
    reloadBundle(bundle: IBundle, autostart: boolean): Promise<void>;

    addServiceListener(
        bundle: IBundle,
        listener: IServiceListener,
        name: any,
        filter: string
    ): IDisposable;
    addBundleListener(bundle: IBundle, listener: IBundleListener): IDisposable;
    addFrameworkListener(bundle: IBundle, listener: IFrameworkListener): IDisposable;
    removeServiceListener(bundle: IBundle, listener: IServiceListener): void;
    removeBundleListener(bundle: IBundle, listener: IBundleListener): void;
    removeFrameworkListener(bundle: IBundle, listener: IFrameworkListener): void;
}

export interface IEventListeners {
    contains(bundle: IBundle, listener: any);
    size(): number;
    remove(bundle: IBundle, listener: any);
    add(bundle, listener, filter?: any);
    fire(event: any);
    clean(bundle: any);
}

export interface IBundle {
    readonly id: number;
    readonly meta: any;
    readonly state: number;
    readonly context: IBundleContext;

    start();
    stop();
    reload(autostart: boolean);
    uninstall();
}

export interface IBundleContext {
    getProperty(name: string, def: any): any;
    getProperties(): Properties;
    getService(reference: IServiceReference): any;
    ungetService(reference: IServiceReference): any;
    getServiceReferences(name: any, filter?: any): IServiceReference[];
    getServiceReference(name: any, filter: any): IServiceReference;
    getBundle(id: number): IBundle;
    getBundles(): Array<IBundle>;
    registerService(
        name: any,
        service: any,
        properties?: Properties
    ): Promise<IServiceRegistration>;
    addServiceListener(listener: IServiceListener, name: any, filter: string): IDisposable;
    addBundleListener(listener: IBundleListener): IDisposable;
    addFrameworkListener(listener: IFrameworkListener): IDisposable;
    removeServiceListener(listener: IServiceListener): void;
    removeBundleListener(listener: IBundleListener): void;
    removeFrameworkListener(listener: IFrameworkListener): void;

    serviceTracker(name: any, listener: IServiceTrackerListener, filter?: string);
    bundleTracker(mask: number, listener: IBundleTrackerListener);
}

export interface IServiceReference {
    readonly id: number;
    readonly bundle: IBundle;

    getProperty(key: string): any;
    getProperties(): Properties;
    usingBundles(): IBundle[];
}

export interface IServiceRegistration {
    readonly reference: IServiceReference;
    unregister(): void;
}

export interface IEvent {
    readonly type: number;
}

export interface IServiceEvent extends IEvent {
    readonly reference: IServiceReference;
    readonly properties: any;
}

export interface IBundleEvent extends IEvent {
    readonly bundle: IBundle;
}

export interface IFrameworkEvent extends IBundleEvent {}

export interface IListener {

}

export interface IBundleListener extends IListener {
    bundleEvent(event: IBundleEvent): void;
}

export interface IFrameworkListener extends IListener {
    frameworkEvent(event: IFrameworkEvent): void;
}

export interface IServiceListener extends IListener {
    serviceEvent(event: IServiceEvent): void;
}

export interface IFrameworkListener {
    add(listener: IFrameworkListener): void;
    remove(listener: IFrameworkListener): void;
}

export interface IBundleEvents {
    add(listener: IBundleListener): void;
    remove(listener: IBundleListener): void;
}

export interface IServiceEvents {
    add(listener: IServiceListener, name: any, filter: string): void;
    remove(listener: IServiceListener): void;
}

interface IServiceTrackerListenerObject {
    addingService(service: any, reference: IServiceReference): void;
    modifiedService(service: any, reference: IServiceReference): void;
    removedService(service: any, reference: IServiceReference): void;
}

interface IServiceTrackerListenerFunction {
    (service: any, reference: IServiceReference): IDisposable | undefined;
}
export type IServiceTrackerListener =
    | IServiceTrackerListenerObject
    | IServiceTrackerListenerFunction;

export interface IServiceTrackerCustomizer {
    adding(reference: IServiceReference): any;
    modified(reference: IServiceReference, service: any): void;
    removed(reference: IServiceReference, service: any): void;
}

export interface IBundleTrackerListener {
    addingBundle(bundle: IBundle): void;
    modifiedBundle(bundle: IBundle): void;
    removedBundle(bundle: IBundle): void;
}

export interface IBundleTracker extends IBundleTrackerListener {
    open(): void;
    close(): void;
    size(): number;
    bundles(): IBundle[];
}
