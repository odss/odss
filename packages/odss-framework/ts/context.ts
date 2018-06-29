import {
    ServiceTracker,
    BundleTracker,
    IBundleContext,
    IBundle,
    IFramework,
    IContextEvents,
    IServiceReference,
    IBundleTrackerListener,
    IServiceTrackerListener,
    IListener
} from 'odss-common';
import { prepareFilter } from './utils';


export default class BundleContext implements IBundleContext {
    public readonly framework: IFramework;
    public readonly bundle: IBundle;
    public readonly services: any;
    public readonly bundles: any;
    public readonly on: any;

    constructor(framework: IFramework, bundle: IBundle) {
        this.framework = framework;
        this.bundle = bundle;
        this.on = createEvents(framework, bundle);
        Object.freeze(this);
    }

    property(name: string, def: any) {
        return this.framework.property(name, def);
    }

    getBundle(bundleId: number) {
        return this.framework.getBundle(bundleId);
    }
    getBundles() {
        return this.framework.getBundles();
    }
    async installBundle(location: string, autoStart:boolean=false) {
        return await this.framework.installBundle(location, autoStart);
    }
    async uninstallBundle(bundle: IBundle) {
        return await this.framework.uninstallBundle(bundle);
    }
    getServiceReferences(name: any, filter: string) {
        return this.framework.registry.findReferences(name, filter);
    }
    getServiceReference(name: any, filter: string) {
        return this.framework.registry.findReference(name, filter);
    }
    getService(reference: IServiceReference) {
        return this.framework.registry.find(this.bundle, reference);
    }
    ungetService(reference: IServiceReference) {
        return this.framework.registry.unget(this.bundle, reference);
    }
    registerService(name: any, service: any, properties: any) {
        return this.framework.registry.registerService(this.bundle, name, service, properties);
    }
    styles(...styles: string[]): {unregister: Function} {
        return this.framework.registry.registerStyles(this.bundle, styles);
    }
    serviceTracker(name: any, listener: IServiceTrackerListener, filter: string = null) {
        return new ServiceTracker(this, prepareFilter(name, filter), listener);
    }
    bundleTracker(mask: number, listener: IBundleTrackerListener) {
        return new BundleTracker(this, mask, listener);
    }
    onService(listener: IServiceListener, name: any, filter: string = ''){
        return this.framework.onService(listener, name, filter);
    }
    onBundle(listener: IBundleListener) {
        return this.framework.onBundle(listener);
    }
    onFramework(listener: IFrameworkListener) {
        return this.framework.onFramework(listener);
    }
}

function createEvents(framework: IFramework, bundle: IBundle) {
    return Object.freeze({
        service: createEvent(framework.on.service, bundle),
        bundle: createEvent(framework.on.bundle, bundle),
        framework: createEvent(framework.on.framework, bundle)
    })
};

function createEvent<T>(dispacher: any, bundle: IBundle) {
    return Object.freeze({
        add(listener: IListener, filter:any) {
            dispacher.add(bundle, listener, filter);
        },
        remove(listener: IListener) {
            dispacher.remove(bundle, listener);
        }
    });
}
