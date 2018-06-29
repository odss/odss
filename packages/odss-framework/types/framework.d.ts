import Bundle from './bundle';
import Loader from './loader';
import Registry from './registry';
import EventDispatcher from './events';
export declare class Framework extends Bundle {
    private _SID;
    private _loader;
    private _bundles;
    private _properties;
    private _activators;
    on: EventDispatcher;
    registry: Registry;
    constructor(properties?: {});
    nextSid(): number;
    /**
     * Return selectede property
     *
     * @param {String} name
     * @param {Object} def Default value
     */
    property(name: any, defaultProperty: any): any;
    /**
     * @return {Object}
     */
    properties(): any;
    start(): Promise<void>;
    stop(): Promise<void>;
    uninstall(): Promise<void>;
    update(): Promise<void>;
    setLoader(loader: any): void;
    getLoader(): Loader;
    hasBundle(bundleId: any): boolean;
    getBundle(obj: any): Bundle;
    getBundles(): Bundle[];
    installBundle(location: string, autostart: boolean): Promise<Bundle>;
    startBundle(bundle: Bundle): Promise<boolean>;
    stopBundle(bundle: Bundle): Promise<boolean>;
    reloadBundle(bundle: Bundle, autostart: boolean): Promise<void>;
    uninstallBundle(bundle: Bundle): Promise<boolean>;
    _fireBundleEvent(type: number, bundle: Bundle): void;
    _fireServiceEvent(type: number, ref: any): void;
    _fireFrameworkEvent(type: number): void;
}
export declare class FrameworkFactory {
    /**
     * Create a new Framework instance.
     * @param {Object} config
     * @return New configured Framework
     */
    create(config: any): Framework;
}
