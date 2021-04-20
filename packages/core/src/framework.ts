import {
    ILoader,
    IBundle,
    Events,
    Bundles,
    FrameworkEvent,
    ServiceEvent,
    BundleEvent,
    IActivator,
    IServiceReference,
    Properties,
    IModule,
} from '@odss/common';
import Bundle from './bundle';
import BundleContext from './context';
import { createDefaultLoader } from './loader';
import Registry from './registry';
import EventDispatcher from './events';

const FRAMEWORK_ID = 0;

export class Framework extends Bundle implements IBundle {
    // readonly id: number = FRAMEWORK_ID;
    // readonly name: string = 'odss.framework';
    // readonly version: string = '0.0.0';
    // readonly meta: any = {};

    // context: IBundleContext;
    // state: number = Bundles.INSTALLED;

    private _SID = 0;
    private _loader?: ILoader;
    private _bundles: Map<number, Bundle> = new Map();
    private _properties: any = {};
    private _activators: Map<number, IActivator> = new Map();

    public on: EventDispatcher;
    public registry: Registry;

    constructor(properties: any = {}) {
        super(FRAMEWORK_ID, null, { path: '@odss/core', name: '@odss/core' });
        this._properties = properties;
        this._bundles.set(this.id, this);
        this.on = new EventDispatcher();
        this.registry = new Registry(this.on);
    }

    private _nextSid() {
        return (this._SID += 1);
    }
    getProperty(name, defaultProperty = null): any {
        if (Object.prototype.hasOwnProperty.call(this._properties, name)) {
            return this._properties[name];
        }
        if (defaultProperty !== undefined) {
            return defaultProperty;
        }
        return null;
    }
    getProperties(): Properties {
        return { ...this._properties };
    }

    setLoader(loader: ILoader) {
        this._loader = loader;
    }

    getLoader(): ILoader {
        if (!this._loader) {
            const properties = this.getProperty('loader', {});
            this._loader = createDefaultLoader(properties);
        }
        return this._loader;
    }

    hasBundle(bundleId) {
        if (typeof bundleId === 'number') {
            if (this._bundles.has(bundleId)) {
                return true;
            }
        } else if (typeof bundleId === 'string') {
            for (const bundle of this._bundles.values()) {
                if (bundle.name === bundleId) {
                    return true;
                }
            }
        }
        return false;
    }
    getBundle(identifier: string | number): IBundle {
        if (typeof identifier === 'number') {
            if (this._bundles.has(identifier)) {
                return this._bundles.get(identifier);
            }
            throw new Error('Not found: Bundle(id=' + identifier + ')');
        } else if (typeof identifier === 'string') {
            for (const bundle of this._bundles.values()) {
                if (bundle.name === identifier) {
                    return bundle;
                }
            }
            throw new Error('Not found: Bundle(name=' + identifier + ')');
        }
        throw new Error('Incorect bundle identifier: ' + identifier);
    }
    getBundles(): IBundle[] {
        return [...this._bundles.values()];
    }
    async start(): Promise<void> {
        if (this.state === Bundles.ACTIVE || this.state === Bundles.STARTING) {
            return;
        }
        if (this.state === Bundles.STOPPING) {
            throw new Error('Cannot start stoping bundle');
        }
        this._fireBundleEvent(Events.STARTING, this);
        this.updateState(Bundles.ACTIVE);
        for (const [id, bundle] of this._bundles.entries()) {
            //framework bundle
            if (id === 0) {
                continue;
            }
            try {
                await this.startBundle(bundle);
            } catch (e) {
                console.error(`Problem with start a bundle: ${bundle.name}`, e);
            }
        }
        this._fireBundleEvent(Events.STARTED, this);
    }
    async stop(): Promise<void> {
        if (this.state !== Bundles.ACTIVE) {
            return;
        }
        this.updateState(Bundles.STOPPING);
        this._fireBundleEvent(Events.STOPPING, this);

        this.updateState(Bundles.RESOLVED);
        const bundles = Array.from(this._bundles.values()).reverse();
        for (const bundle of bundles) {
            if (bundle.id === FRAMEWORK_ID) {
                continue;
            }
            try {
                await this.stopBundle(bundle);
            } catch (e) {
                console.error(`Problem with stop a bundle: ${bundle.name}`, e);
            }
        }
        this._fireBundleEvent(Events.STOPPED, this);
    }
    async uninstall(): Promise<void> {
        throw new Error('Not allowed uninstall framework.');
    }
    async reload(): Promise<void> {
        throw new Error('Not allowed reload framework');
    }

    async installBundle(name: string, autostart = true): Promise<IBundle> {
        const module = await this.getLoader().loadBundle(name);
        const bundle = new Bundle(this._nextSid(), this, module);
        this._bundles.set(bundle.id, bundle);
        this._activators.set(bundle.id, getActivator(module));
        this._fireBundleEvent(Events.INSTALLED, bundle);
        if (autostart) {
            await bundle.start();
        }
        return bundle;
    }

    async startBundle(bundle: Bundle): Promise<boolean> {
        if (bundle.id === FRAMEWORK_ID) {
            throw new Error('Cannot start framework bundle: ' + bundle.name);
        }
        const state = bundle.state;

        if (state === Bundles.ACTIVE) {
            console.warn(`'Bundle: ${bundle.name} already active`);
            return false;
        }
        if (state === Bundles.STARTING) {
            throw new Error('Bundle ' + bundle.name + ' cannot be started, since it is stopping');
        }
        if (state === Bundles.UNINSTALLED) {
            throw new Error('Cannot start uninstalled bundle: ' + bundle.name);
        }

        bundle.setContext(new BundleContext(this, bundle));
        bundle.updateState(Bundles.STARTING);
        this._fireBundleEvent(Events.STARTING, bundle);

        try {
            const activator = this._activators.get(bundle.id);
            await activator.start(bundle.context);
            bundle.updateState(Bundles.ACTIVE);
            this._fireBundleEvent(Events.STARTED, bundle);
        } catch (e) {
            bundle.unsetContext();
            bundle.updateState(state);
            this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.removeAll(bundle);
            throw e;
        }
        return true;
    }
    async stopBundle(bundle: Bundle): Promise<boolean> {
        if (bundle.id === FRAMEWORK_ID) {
            throw new Error('Cannot stop framework bundle: ' + bundle.name);
        }
        const state = bundle.state;

        if (state === Bundles.UNINSTALLED) {
            throw new Error('Cannot stop uninstalled bundle: ' + bundle.name);
        }
        if (state === Bundles.STOPPING) {
            throw new Error(
                'Bundle: ' + bundle.name + ' cannot be stopped since it is already stopping'
            );
        }

        if (state !== Bundles.ACTIVE) {
            return true;
        }

        bundle.updateState(Bundles.STOPPING);
        this._fireBundleEvent(Events.STOPPING, bundle);
        try {
            const activator = this._activators.get(bundle.id);
            await activator.stop(bundle.context);
            await this.getLoader().unloadBundle(bundle.name);
            bundle.unsetContext();
            bundle.updateState(Bundles.RESOLVED);
            this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.removeAll(bundle);
            this._fireBundleEvent(Events.STOPPED, bundle);
        } catch (e) {
            bundle.updateState(state);
            console.error(`Activator stop error in : ${bundle.name}`, e);
            return false;
        }
        return true;
    }

    async reloadBundle(bundle: Bundle, autostart: boolean): Promise<void> {
        if (await this.uninstallBundle(bundle)) {
            await this.installBundle(bundle.name, autostart);
        }
    }
    async uninstallBundle(bundle: Bundle): Promise<boolean> {
        await sleep();
        if (bundle.id === FRAMEWORK_ID) {
            console.error(`Cannot uninstall main bundle: ${bundle.name}`);
            return false;
        }
        if (bundle.state !== Bundles.UNINSTALLED) {
            const bundles = this._bundles;
            if (bundles.has(bundle.id)) {
                await this.stopBundle(bundle);
                this._activators.delete(bundle.id);
                bundles.delete(bundle.id);
                this._bundles.delete(bundle.id);
                bundle.updateState(Bundles.UNINSTALLED);
                this._fireBundleEvent(Events.UNINSTALLED, bundle);
            }
        }
        return true;
    }
    _fireBundleEvent(type: number, bundle: IBundle): void {
        if (this === bundle) {
            this.on.framework.fire(new FrameworkEvent(type, bundle));
        }
        this.on.bundle.fire(new BundleEvent(type, bundle));
    }
    _fireServiceEvent(type: number, ref: any): void {
        this.on.service.fite(new ServiceEvent(type, ref));
    }
    _fireFrameworkEvent(type: number): void {
        this.on.framework.fire(new FrameworkEvent(type, this));
    }
    getService(bundle: IBundle, reference: IServiceReference): any {
        return this.registry.find(bundle, reference);
    }
    getRegisteredServices(): IServiceReference[] {
        return [];
    }
    getServicesInUse(): IServiceReference[] {
        return [];
    }
    getBundleServices(bundle: IBundle): IServiceReference[] {
        return this.registry.findBundleReferences(bundle);
    }
    getBundelServicesInUse(bundle: IBundle): IServiceReference[] {
        return this.registry.findBundleReferencesInUse(bundle);
    }
}

function getActivator(config: IModule): IActivator {
    if (Object.prototype.hasOwnProperty.call(config, 'Activator')) {
        return new config.Activator();
    }
    const fn = () => {};
    const start = config.start || fn;
    const stop = config.stop || fn;
    return {
        start,
        stop,
    } as IActivator;
}

export class FrameworkFactory {
    create(properties: any = {}): Framework {
        return new Framework(properties);
    }
}

function sleep() {
    return Promise.resolve();
}
