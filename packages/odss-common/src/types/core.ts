export type NamedServiceType =
    | string
    | (() => void)
    | {
          name: string;
      };
export type ServiceType = any;

export type Properties = {
    [key: string]: any;
};

export type FilterType = string | Properties;

export type ModuleType = {
    [key: string]: any;
};
export interface ILoader {
    loadBundle(location: string): Promise<ModuleType>;
    unloadBundle(location: string): Promise<void>;
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
        name: NamedServiceType,
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
    readonly state: number;
    readonly location: string;
    readonly context: IBundleContext;
    readonly version: string;
    // readonly meta: any;

    start(): Promise<void>;
    stop(): Promise<void>;
    reload(): Promise<void>;
    uninstall(): Promise<void>;

    /**
     * Returns this bundle's {@code IServiceReference} list for all services it
     * has registered.
     */
    getRegisteredServices(): IServiceReference[];

    /**
     * Returns this bundle's {@code IServiceReference} list for all services it
     * is using.
     */
    getServicesInUse(): IServiceReference[];
}
export interface IServiceObject {
    getService(): any;
    ungetService(): void;
    getServiceReference(): IServiceReference;
}

export interface IBundleContext {
    installBundle(location: string, autostart: boolean): Promise<IBundle>;
    registerService(name: any, service: any, properties?: Properties): IServiceRegistration;
    getServiceReference(name: NamedServiceType, filter?: FilterType): IServiceReference;
    getServiceReferences(name: NamedServiceType, filter?: FilterType): IServiceReference[];
    // getBundleServiceReferences(name: any, filter?: any): IServiceReference[];
    getService(reference: IServiceReference): any;
    getServiceObject(reference: IServiceReference): IServiceObject;
    ungetService(reference: IServiceReference): any;
    getBundle(id?: number): IBundle;
    getBundles(): Array<IBundle>;
    getProperty(name: string, def: any): any;

    addServiceListener(listener: IServiceListener, name: any, filter: FilterType): IDisposable;
    addBundleListener(listener: IBundleListener): IDisposable;
    addFrameworkListener(listener: IFrameworkListener): IDisposable;
    removeServiceListener(listener: IServiceListener): void;
    removeBundleListener(listener: IBundleListener): void;
    removeFrameworkListener(listener: IFrameworkListener): void;

    serviceTracker<TService>(
        name: NamedServiceType,
        listener: IServiceTrackerListener<TService>,
        filter?: FilterType
    );
    bundleTracker(mask: number, listener: IBundleTrackerListener);
}

export interface IServiceReference {
    getProperty(key: string): any;
    getProperties(): Properties;
    getPropertyKeys(): string[];
    usingBundles(): IBundle[];
}

export interface IServiceRegistration {
    getReference(): IServiceReference;
    setProperties(properties: Properties): void;
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

export interface IBundleListener {
    bundleEvent(event: IBundleEvent): void;
}

export interface IFrameworkListener {
    frameworkEvent(event: IBundleEvent): void;
}

export interface IServiceListener {
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
    add(listener: IServiceListener, name: NamedServiceType, filter: string): void;
    remove(listener: IServiceListener): void;
}

export interface IServiceTracker<TService extends ServiceType> {
    open(): void;
    close(): void;
    size(): number;
    bundles(): IBundle[];
    getReference(): IServiceReference;
    getReferences(): IServiceReference[];
    getService(): TService;
    getServices(): TService[];
}
export interface IServiceTrackerListener<TService extends ServiceType> {
    addingService(service: TService, reference: IServiceReference): void;
    modifiedService(service: TService, reference: IServiceReference): void;
    removedService(service: TService, reference: IServiceReference): void;
}

export interface IServiceTrackerListenerFunction<TService> {
    (service: TService, reference: IServiceReference): IDisposable | undefined;
}
export type IServiceTrackerListenerType<TService extends ServiceType> =
    | IServiceTrackerListener<TService>
    | IServiceTrackerListenerFunction<TService>;

export interface IServiceTrackerCustomizer<TService> {
    adding(reference: IServiceReference): TService;
    modified(reference: IServiceReference, service: TService): void;
    removed(reference: IServiceReference, service: TService): void;
}

export interface IBundleTrackerListener {
    addingBundle(bundle: IBundle): void;
    modifiedBundle(bundle: IBundle): void;
    removedBundle(bundle: IBundle): void;
}

export interface IBundleTracker {
    open(): void;
    close(): void;
    size(): number;
    bundles(): IBundle[];
}
