import { IServiceListener, IBundleListener, IFrameworkListener } from '../../odss-common/types/interfaces';
import { IBundleContext, IBundle, IFramework, IServiceReference, IBundleTrackerListener, IServiceTrackerListener } from 'odss-common';
export default class BundleContext implements IBundleContext {
    readonly framework: IFramework;
    readonly bundle: IBundle;
    readonly services: any;
    readonly bundles: any;
    readonly on: any;
    constructor(framework: IFramework, bundle: IBundle);
    property(name: string, def: any): any;
    getBundle(bundleId: number): any;
    getBundles(): any;
    installBundle(location: string, autoStart?: boolean): Promise<any>;
    uninstallBundle(bundle: IBundle): Promise<any>;
    getServiceReferences(name: any, filter: string): any;
    getServiceReference(name: any, filter: string): any;
    getService(reference: IServiceReference): any;
    ungetService(reference: IServiceReference): any;
    registerService(name: any, service: any, properties: any): any;
    styles(...styles: string[]): {
        unregister: Function;
    };
    serviceTracker(filter: any, listener: IServiceTrackerListener): any;
    bundleTracker(mask: number, listener: IBundleTrackerListener): any;
    onService(listener: IServiceListener, name: any, filter?: string): any;
    onBundle(listener: IBundleListener): any;
    onFramework(listener: IFrameworkListener): any;
}
