export type NamedServiceType = any | any[];
// | string | string[]
// | Function |
// | {
//       name: string;
//   };
export type ServiceType = any;

export type Properties = Record<string, any>;

export type Properties2<P> = {
    [Property in keyof P]: P[Property];
};

export type FilterType = string | Properties;

export interface IActivator {
    /**
     * Called when this bundle is started
     *
     * @param ctx IBundleContext
     */
    start?(ctx: IBundleContext): Promise<void>;

    /**
     * Called when this bundle is stopped
     *
     * @param ctx IBundleContext
     */
    stop?(ctx: IBundleContext): Promise<void>;
}

export interface IModule extends IActivator {
    path: string;
    name: string;
    Activator?: new () => IActivator;
    [key: string]: any;
}

export interface ILoader {
    loadBundle(name: string): Promise<IModule>;
    unloadBundle(name: string): Promise<void>;
}

export interface IDisposable {
    dispose(): void;
}

export type IDisposableLike = () => {} | IDisposable | undefined;

export interface IBundle {
    readonly id: number;
    readonly state: number;
    readonly name: string;
    readonly context: IBundleContext;
    readonly version: string;
    readonly module: IModule;

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

export interface IFramework extends IBundle {
    getProperty<T = any>(name: string, defaultValue?: T): T;
    getProperties<P extends Properties>(): P;
    hasBundle(identifier: number | string): boolean;
    getBundle(identifier: number | string): IBundle;
    getBundles(): Array<IBundle>;
    installBundle(name: string, autostart: boolean): Promise<IBundle>;
    uninstallBundle(bundle: IBundle): Promise<boolean>;
    startBundle(bundle: IBundle): Promise<boolean>;
    stopBundle(bundle: IBundle): Promise<boolean>;
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

export interface IEventListeners<T = any, E = any> {
    contains(bundle: IBundle, listener: T): boolean;
    size(): number;
    remove(bundle: IBundle, listener: T): void;
    add(bundle: IBundle, listener: T, filter?: string): void;
    fire(event: E): void;
    clean(bundle: E): void;
}
export interface IServiceObject<S> {
    getService(): S;
    ungetService(): void;
    getServiceReference(): IServiceReference;
}

export interface IBundleContext {
    installBundle(name: string, autostart: boolean): Promise<IBundle>;
    registerService<S>(
        name: NamedServiceType,
        service: S,
        properties?: Properties
    ): Promise<IServiceRegistration>;
    getServiceReference(name?: NamedServiceType, filter?: FilterType): IServiceReference;
    getServiceReferences(name?: NamedServiceType, filter?: FilterType): IServiceReference[];
    // getBundleServiceReferences(name: any, filter?: any): IServiceReference[];
    getService<S>(reference: IServiceReference): S;
    getServiceObject<S>(reference: IServiceReference): IServiceObject<S>;
    ungetService(reference: IServiceReference): void;
    getBundle(): IBundle;
    getBundleById(id: number): IBundle;
    getBundleByName(name: string): IBundle;
    getBundles(): IBundle[];
    getProperty<T>(name: string, defaultValue?: T): T;
    getProperties<P extends Properties>(): P;
    addServiceListener(listener: IServiceListener, name: any, filter: FilterType): IDisposable;
    addBundleListener(listener: IBundleListener): IDisposable;
    addFrameworkListener(listener: IFrameworkListener): IDisposable;
    removeServiceListener(listener: IServiceListener): void;
    removeBundleListener(listener: IBundleListener): void;
    removeFrameworkListener(listener: IFrameworkListener): void;
    createServiceTracker<S>(
        name: NamedServiceType,
        listener?: IServiceTrackerListenerType<S>,
        filter?: FilterType
    ): IServiceTrackerListener<S>;
}

export interface IServiceReference {
    getProperty<T = any>(name: string, defaultValue?: T): T;
    getProperties<P extends Properties>(): P;
    getPropertyKeys(): string[];
    usingBundles(): IBundle[];
    compare(ref: IServiceReference): number;
}

export interface IServiceRegistration {
    getReference(): IServiceReference;
    setProperties(properties: Properties): Promise<void>;
    unregister(): Promise<void>;
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
    bundleEvent(event: IBundleEvent): Promise<void>;
}

export interface IFrameworkListener {
    frameworkEvent(event: IBundleEvent): Promise<void>;
}

export interface IServiceListener {
    serviceEvent(event: IServiceEvent): Promise<void>;
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
    open(): Promise<void>;
    close(): Promise<void>;
    size(): number;
    bundles(): IBundle[];
    getReference(): IServiceReference;
    getReferences(): IServiceReference[];
    getService(): TService;
    getServices(): TService[];
}
export interface IServiceTrackerListener<TService extends ServiceType> {
    addingService(service: TService, reference: IServiceReference): Promise<void>;
    modifiedService(service: TService, reference: IServiceReference): Promise<void>;
    removedService(service: TService, reference: IServiceReference): Promise<void>;
}

export interface IServiceTrackerListenerFunction<TService> {
    (service: TService, reference: IServiceReference): IDisposable | undefined;
}
export type IServiceTrackerListenerType<TService extends ServiceType> =
    | IServiceTrackerListener<TService>
    | IServiceTrackerListenerFunction<TService>;

export interface IServiceTrackerCustomizer<TService> {
    adding(reference: IServiceReference): Promise<TService>;
    modified(reference: IServiceReference, service: TService): Promise<void>;
    removed(reference: IServiceReference, service: TService): Promise<TService>;
}

export interface IBundleTrackerListener {
    addingBundle(bundle: IBundle): Promise<void>;
    modifiedBundle(bundle: IBundle): Promise<void>;
    removedBundle(bundle: IBundle): Promise<void>;
}

export interface IBundleTracker {
    open(): Promise<void>;
    close(): Promise<void>;
    size(): number;
    bundles(): IBundle[];
}
