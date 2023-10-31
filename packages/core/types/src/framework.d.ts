import { ILoader, IBundle, IFramework, IServiceReference, Properties } from '@odss/common';
import Bundle from './bundle';
import Registry from './registry';
import EventDispatcher from './events';
export declare class Framework extends Bundle implements IFramework {
    private _SID;
    private _loader;
    private _bundles;
    private _properties;
    private _activators;
    on: EventDispatcher;
    registry: Registry;
    constructor(properties?: Record<string, unknown>);
    private _nextSid;
    getProperty<T = any>(name: string, defaultProperty?: T): T;
    getProperties<P extends Properties>(): P;
    useLoader(loader: ILoader): void;
    getLoader(): ILoader;
    hasBundle(identifier: number | string): boolean;
    getBundle(identifier: number | string): IBundle;
    getBundles(): IBundle[];
    start(): Promise<void>;
    stop(): Promise<void>;
    uninstall(): Promise<void>;
    reload(): Promise<void>;
    installBundle(name: string, autostart?: boolean): Promise<IBundle>;
    startBundle(bundle: Bundle): Promise<boolean>;
    stopBundle(bundle: Bundle): Promise<boolean>;
    reloadBundle(bundle: Bundle, autostart: boolean): Promise<void>;
    uninstallBundle(bundle: Bundle): Promise<boolean>;
    _fireBundleEvent(type: number, bundle: IBundle): Promise<void>;
    _fireServiceEvent(type: number, ref: IServiceReference): Promise<void>;
    _fireFrameworkEvent(type: number): Promise<void>;
    getService(bundle: IBundle, reference: IServiceReference): any;
    getRegisteredServices(): IServiceReference[];
    getServicesInUse(): IServiceReference[];
    getBundleServices(bundle: IBundle): IServiceReference[];
    getBundelServicesInUse(bundle: IBundle): IServiceReference[];
}
export declare class FrameworkFactory {
    create(properties?: any): Framework;
}
