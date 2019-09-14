import {
    ServiceTracker,
    BundleTracker,
    IBundleContext,
    IBundle,
    IFramework,
    IServiceReference,
    IServiceListener,
    IBundleListener,
    IFrameworkListener,
    IBundleTrackerListener,
    IServiceTrackerListener,
    IListener
} from '@odss/common';


export default class BundleContext implements IBundleContext {
    public readonly framework: IFramework;
    public readonly bundle: IBundle;
    public readonly on: any;

    constructor(framework: IFramework, bundle: IBundle) {
        this.framework = framework;
        this.bundle = bundle;
        this.on = createEvents(framework, bundle);
        Object.freeze(this);
    }

    getProperty(name: string, def: any) {
        return this.framework.getProperty(name, def);
    }
    getProperties() {
        return this.framework.getProperties();
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
    getServiceReferences(name: any, filter: string = '') {
        return this.framework.registry.findReferences(name, filter);
    }
    getServiceReference(name: any, filter: string = '') {
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
    registerStyle(...styles: string[]): {unregister: Function} {
        return this.framework.registry.registerStyle(this.bundle, styles);
    }
    serviceTracker(name: any, listener: IServiceTrackerListener, filter: string = '') {
        return new ServiceTracker(this, name, listener, filter);
    }
    bundleTracker(mask: number, listener: IBundleTrackerListener) {
        return new BundleTracker(this, mask, listener);
    }
    onService(listener: IServiceListener, name: any, filter: string = '') {
        // return this.framework.onService(listener, name, filter);
    }
    onBundle(listener: IBundleListener) {
        // return this.framework.onBundle(listener);
    }
    onFramework(listener: IFrameworkListener) {
        // return this.framework.onFramework(listener);
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
        add(listener: IListener, name: any, filter:string='') {
            dispacher.add(bundle, listener, name, filter);
        },
        remove(listener: IListener) {
            dispacher.remove(bundle, listener);
        }
    });
}
