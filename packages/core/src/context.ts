import {
    IBundleContext,
    IBundle,
    IServiceReference,
    IServiceListener,
    IBundleListener,
    IFrameworkListener,
    IDisposable,
    IServiceObject,
    IServiceRegistration,
} from '@odss/common';
import { ILogger } from '@stool/logging';
import { Framework } from './framework';

class ServiceObject<S> implements IServiceObject<S> {
    constructor(private _ctx: IBundleContext, private _reference: IServiceReference) {}
    getService(): S {
        return this._ctx.getService(this._reference);
    }
    ungetService(): void {
        this._ctx.ungetService(this._reference);
    }
    getServiceReference(): IServiceReference {
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

    getProperty(name: string, def: any = null): any {
        return this.framework.getProperty(name, def);
    }
    getProperties(): any {
        return this.framework.getProperties();
    }
    getBundle(bundleId: number): IBundle {
        return this.framework.getBundle(bundleId);
    }
    getBundles(): IBundle[] {
        return this.framework.getBundles();
    }
    async installBundle(name: string, autoStart = false): Promise<IBundle> {
        return await this.framework.installBundle(name, autoStart);
    }
    async uninstallBundle(bundle: IBundle): Promise<boolean> {
        return await this.framework.uninstallBundle(bundle as any);
    }
    getServiceReferences(name: any = null, filter = ''): IServiceReference[] {
        return this.framework.registry.findReferences(name, filter);
    }
    getServiceReference(name: any, filter = ''): IServiceReference {
        return this.framework.registry.findReference(name, filter);
    }
    getService(reference: IServiceReference): any {
        return this.framework.registry.find(this.bundle, reference);
    }
    getServiceObject<S>(reference: IServiceReference): ServiceObject<S> {
        return new ServiceObject(this, reference);
    }
    ungetService(reference: IServiceReference): void {
        this.framework.registry.unget(this.bundle, reference);
    }
    async registerService(name: any, service: any, properties: any = {}): Promise<IServiceRegistration> {
        return this.framework.registry.registerService(this.bundle, name, service, properties);
    }
    // onService(listener: IServiceListener, name: any, filter = ''): void {
    //     // return this.framework.onService(listener, name, filter);
    // }
    // onBundle(listener: IBundleListener): void {
    //     // return this.framework.onBundle(listener);
    // }
    // onFramework(listener: IFrameworkListener): void {
    //     // return this.framework.onFramework(listener);
    // }
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

function createEvent(dispacher: any, bundle: IBundle) {
    return Object.freeze({
        add(listener: any, name: any, filter = '') {
            dispacher.add(bundle, listener, name, filter);
        },
        remove(listener: any) {
            dispacher.remove(bundle, listener);
        },
    });
}
