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
    IDisposable,
    IServiceObject,
    IServiceRegistration,
    FilterType,
} from '@odss/common';
import { Framework } from './framework';
import Bundle from './bundle';

class ServiceObject implements IServiceObject {
    constructor(private _ctx: IBundleContext, private _reference: IServiceReference) {}
    getService(): any {
        this._ctx.getService(this._reference);
    }
    ungetService() {
        this._ctx.ungetService(this._reference);
    }
    getServiceReference() {
        return this._reference;
    }
}

export default class BundleContext implements IBundleContext {
    public readonly framework: Framework;
    public readonly bundle: IBundle;
    public readonly on: any;

    constructor(framework: Framework, bundle: IBundle) {
        this.framework = framework;
        this.bundle = bundle;
        this.on = createEvents(framework, bundle);
        Object.freeze(this);
    }

    getProperty(name: string, def: any) {
        return this.framework.getProperty(name, def);
    }
    getProperties(): any {
        return this.framework.getProperties();
    }

    getBundle(bundleId: number) {
        return this.framework.getBundle(bundleId);
    }
    getBundles() {
        return this.framework.getBundles();
    }
    async installBundle(location: string, autoStart = false) {
        return await this.framework.installBundle(location, autoStart);
    }
    async uninstallBundle(bundle: IBundle) {
        return await this.framework.uninstallBundle(bundle as any);
    }
    getServiceReferences(name: any = null, filter = '') {
        return this.framework.registry.findReferences(name, filter);
    }
    getServiceReference(name: any, filter = '') {
        return this.framework.registry.findReference(name, filter);
    }
    getService(reference: IServiceReference): any {
        return this.framework.registry.find(this.bundle, reference);
    }
    getServiceObject(reference: IServiceReference): ServiceObject {
        return new ServiceObject(this, reference);
    }
    ungetService(reference: IServiceReference) {
        return this.framework.registry.unget(this.bundle, reference);
    }
    registerService(name: any, service: any, properties: object = {}): IServiceRegistration {
        return this.framework.registry.registerService(this.bundle, name, service, properties);
    }
    registerStyle(...styles: string[]): { unregister: () => void } {
        return this.framework.registry.registerStyle(this.bundle, styles);
    }
    serviceTracker<TService>(
        name: any,
        listener: IServiceTrackerListener<TService>,
        filter: FilterType = ''
    ) {
        return new ServiceTracker(this, name, listener, filter).open();
    }
    bundleTracker(mask: number, listener: IBundleTrackerListener) {
        return new BundleTracker(this, mask, listener);
    }
    onService(listener: IServiceListener, name: any, filter = '') {
        // return this.framework.onService(listener, name, filter);
    }
    onBundle(listener: IBundleListener) {
        // return this.framework.onBundle(listener);
    }
    onFramework(listener: IFrameworkListener) {
        // return this.framework.onFramework(listener);
    }
    addServiceListener(listener: IServiceListener, name: any, filter: string): IDisposable {
        return this.framework.on.service.add(this.bundle, listener, name, filter);
    }
    addBundleListener(listener: IBundleListener): IDisposable {
        return this.framework.on.bundle.add(this.bundle, listener);
    }
    addFrameworkListener(listener: IFrameworkListener): IDisposable {
        return this.framework.on.framework.add(this.bundle, listener);
    }
    removeServiceListener(listener: IServiceListener): void {
        return this.framework.on.service.remove(this.bundle, listener);
    }
    removeBundleListener(listener: IBundleListener): void {
        return this.framework.on.bundle.remove(this.bundle, listener);
    }
    removeFrameworkListener(listener: IFrameworkListener): void {
        return this.framework.on.framework.remove(this.bundle, listener);
    }
}

function createEvents(framework: Framework, bundle: IBundle) {
    return Object.freeze({
        service: createEvent(framework.on.service, bundle),
        bundle: createEvent(framework.on.bundle, bundle),
        framework: createEvent(framework.on.framework, bundle),
    });
}

function createEvent<T>(dispacher: any, bundle: IBundle) {
    return Object.freeze({
        add(listener: any, name: any, filter = '') {
            dispacher.add(bundle, listener, name, filter);
        },
        remove(listener: any) {
            dispacher.remove(bundle, listener);
        },
    });
}
