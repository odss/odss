import { BundleTracker, IBundleContext, IBundle, IFramework, IServiceReference, IServiceListener, IBundleListener, IFrameworkListener, IBundleTrackerListener, IServiceTrackerListener } from '@odss/common';
export default class BundleContext implements IBundleContext {
    readonly framework: IFramework;
    readonly bundle: IBundle;
    readonly on: any;
    constructor(framework: IFramework, bundle: IBundle);
    getProperty(name: string, def: any): any;
    getProperties(): any;
    getBundle(bundleId: number): IBundle;
    getBundles(): IBundle[];
    installBundle(location: string, autoStart?: boolean): Promise<any>;
    uninstallBundle(bundle: IBundle): Promise<any>;
    getServiceReferences(name: any, filter?: string): any;
    getServiceReference(name: any, filter?: string): any;
    getService(reference: IServiceReference): any;
    ungetService(reference: IServiceReference): any;
    registerService(name: any, service: any, properties?: object): any;
    registerStyle(...styles: string[]): {
        unregister: () => void;
    };
    serviceTracker(name: any, listener: IServiceTrackerListener, filter?: string): any;
    bundleTracker(mask: number, listener: IBundleTrackerListener): BundleTracker;
    onService(listener: IServiceListener, name: any, filter?: string): void;
    onBundle(listener: IBundleListener): void;
    onFramework(listener: IFrameworkListener): void;
}
