export interface IFramework extends IBundle {
    readonly on: any;
    readonly registry: any;
    getProperty(name: string, defaultValue: any): any;
    getProperties(): any;
    hasBundle(bundle: IBundle): boolean;
    getBundle(bundleId: number): IBundle;
    getBundles(): Array<IBundle>;
    installBundle(location: string, autostart: boolean): any;
    uninstallBundle(bundle: IBundle): any;
}
export interface IEventsListener {
    contains(bundle: any, listener: any): any;
    size(): number;
    remove(bundle: any, listener: any): any;
    add(bundle: any, listener: any, filter?: any): any;
    fire(event: any): any;
    clean(bundle: any): any;
}
export interface IFrameworkEvents {
    framework: IEventsListener;
    bundle: IEventsListener;
    service: IEventsListener;
    fireEvent(event: any): any;
    removeAll(bundle: any): any;
}
export interface IBundle {
    readonly id: number;
    readonly meta: any;
    readonly state: number;
    readonly context: IBundleContext;
    start(): any;
    stop(): any;
    reload(autostart: boolean): any;
    uninstall(): any;
}
export interface IBundleContext {
    framework: IFramework;
    getProperty(name: string, def: any): any;
    getProperties(): any;
    getService(reference: IServiceReference): any;
    ungetService(reference: IServiceReference): any;
    getServiceReferences(name: string, filter?: any): IServiceReference[];
    getServiceReference(name: string, filter: any): IServiceReference;
    getBundle(id: number): IBundle;
    getBundles(): Array<IBundle>;
    on: IContextEvents;
    onService(): any;
    onBundle(): any;
    onFramework(): any;
}
export interface IServiceReference {
    readonly id: number;
    readonly bundle: IBundle;
    getProperty(key: string): any;
    getProperties(): any;
    usingBundles(): IBundle[];
}
export interface IServiceRegistration {
    readonly reference: IServiceReference;
    unregister(): void;
}
export interface IEvent {
}
export interface IServiceEvent extends IEvent {
}
export interface IBundleEvent extends IEvent {
}
export interface IFrameworkEvent extends IBundleEvent {
}
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
export interface IContextEvents {
    readonly bundle: IBundleEvents;
    readonly service: IServiceEvents;
    readonly framework: IFrameworkListener;
}
export interface IServiceTrackerListener {
    addingService(reference: IServiceReference, service: Object): void;
    modifiedService(reference: IServiceReference, service: Object): void;
    removedService(reference: IServiceReference, service: Object): void;
}
export interface IServiceTrackerCustomizer {
    adding(reference: IServiceReference): Object;
    modified(reference: IServiceReference, service: Object): void;
    removed(reference: IServiceReference, service: Object): void;
}
export interface IBundleTrackerListener {
    addingBundle(bundle: IBundle): void;
    modifiedBundle(bundle: IBundle): void;
    removedBundle(bundle: IBundle): void;
}
