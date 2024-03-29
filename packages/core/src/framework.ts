import { getLogger } from '@stool/logging';

import {
    IActivator,
    IBundle,
    ILoader,
    IFramework,
    IServiceReference,
    IServiceListener,
    IBundleListener,
    IFrameworkListener,
    IDisposable,
    NamedServiceType,
    Events,
    Bundles,
    FrameworkEvent,
    ServiceEvent,
    BundleEvent,
    Properties,
    IModule,
} from '@odss/common';
import Bundle from './bundle';
import BundleContext from './context';
import { createDefaultLoader } from './loader';
import Registry from './registry';
import EventDispatcher from './events';

const FRAMEWORK_ID = 0;

const logger = getLogger('@odss/core');

export class Framework extends Bundle implements IFramework {
    private _SID = 0;
    private _loader: ILoader;
    private _bundles: Map<number, Bundle> = new Map();
    private _properties: any = {};
    private _activators: Map<number, IActivator> = new Map();

    public on: EventDispatcher;
    public registry: Registry;

    constructor(properties: Record<string, unknown> = {}) {
        super(FRAMEWORK_ID, null, {
            path: '@odss/core',
            name: '@odss/core',
        });
        this._properties = properties;
        this._bundles.set(this.id, this);
        this.on = new EventDispatcher();
        this.registry = new Registry(this.on);
    }

    private _nextSid() {
        return (this._SID += 1);
    }
    getProperty<T = any>(name: string, defaultProperty: T = null): T {
        if (typeof this._properties[name] !== 'undefined') {
            return this._properties[name];
        }
        if (defaultProperty !== null) {
            return defaultProperty;
        }
        return null;
    }
    getProperties<P extends Properties>(): P {
        return { ...this._properties };
    }
    useLoader(loader: ILoader): void {
        this._loader = loader;
    }
    getLoader(): ILoader {
        if (!this._loader) {
            const properties = this.getProperty('loader', {});
            this._loader = createDefaultLoader(properties);
        }
        return this._loader;
    }
    hasBundle(identifier: number | string): boolean {
        if (typeof identifier === 'number') {
            if (this._bundles.has(identifier)) {
                return true;
            }
        } else if (typeof identifier === 'string') {
            for (const bundle of this._bundles.values()) {
                if (bundle.name === identifier) {
                    return true;
                }
            }
        }
        return false;
    }
    getBundleById(id: number): IBundle {
        if (this._bundles.has(id)) {
            return this._bundles.get(id);
        }
        throw new Error(`Not found: Bundle(id=${id}`);
    }
    getBundleByName(name: string): IBundle {
        for (const bundle of this._bundles.values()) {
            if (bundle.name === name) {
                return bundle;
            }
        }
        throw new Error(`Not found: Bundle(name=${name}`);
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
        logger.debug('Starting framework bundle');
        await this._fireBundleEvent(Events.STARTING, this);
        this.updateState(Bundles.ACTIVE);
        for (const [id, bundle] of this._bundles.entries()) {
            //framework bundle
            if (id === 0) {
                continue;
            }
            try {
                await this.startBundle(bundle);
            } catch (e) {
                logger.error(`Problem with start a bundle: ${bundle.name}`, e);
            }
        }
        await this._fireBundleEvent(Events.STARTED, this);
        logger.debug('Framework bundle started');
    }
    async stop(): Promise<void> {
        if (this.state !== Bundles.ACTIVE) {
            return;
        }
        logger.debug('Stoping framework');
        this.updateState(Bundles.STOPPING);
        await this._fireBundleEvent(Events.STOPPING, this);

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
        await this._fireBundleEvent(Events.STOPPED, this);
        this.on.reset();
        logger.debug('Framework stoped');
    }
    async uninstall(): Promise<void> {
        throw new Error('Not allowed uninstall framework.');
    }
    async reload(): Promise<void> {
        throw new Error('Not allowed reload framework');
    }

    async installBundle(name: string, autostart = true): Promise<IBundle> {
        logger.debug(`Install bundle ${name} (autostart=${autostart})`);
        const module = await this.getLoader().loadBundle(name);
        const bundle = new Bundle(this._nextSid(), this, module);
        this._bundles.set(bundle.id, bundle);
        this._activators.set(bundle.id, getActivator(module));
        await this._fireBundleEvent(Events.INSTALLED, bundle);
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
            logger.warn(`'Bundle: ${bundle.name} already active`);
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
        await this._fireBundleEvent(Events.STARTING, bundle);
        try {
            const activator = this._activators.get(bundle.id);
            await activator.start(bundle.context);
            bundle.updateState(Bundles.ACTIVE);
            await this._fireBundleEvent(Events.STARTED, bundle);
        } catch (e) {
            bundle.unsetContext();
            bundle.updateState(state);
            await this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.cleanBundle(bundle);
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
        await this._fireBundleEvent(Events.STOPPING, bundle);
        try {
            const activator = this._activators.get(bundle.id);
            await activator.stop(bundle.context);
            await this.getLoader().unloadBundle(bundle.name);
            bundle.unsetContext();
            bundle.updateState(Bundles.RESOLVED);
            this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.cleanBundle(bundle);
            await this._fireBundleEvent(Events.STOPPED, bundle);
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
        logger.debug(`Uninstall bundle ${bundle.name}`);
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
                await this._fireBundleEvent(Events.UNINSTALLED, bundle);
            }
        }
        return true;
    }
    async _fireBundleEvent(type: number, bundle: IBundle): Promise<void> {
        if (this === bundle) {
            await this.on.framework.fire(new FrameworkEvent(type, bundle));
        }
        await this.on.bundle.fire(new BundleEvent(type, bundle));
    }
    async _fireServiceEvent(type: number, ref: IServiceReference): Promise<void> {
        await this.on.service.fire(new ServiceEvent(type, ref));
    }
    async _fireFrameworkEvent(type: number): Promise<void> {
        await this.on.framework.fire(new FrameworkEvent(type, this));
    }
    getService(bundle: IBundle, reference: IServiceReference): any {
        return this.registry.find(bundle, reference as any);
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

    addServiceListener(
        bundle: IBundle,
        listener: IServiceListener,
        name: NamedServiceType,
        filter: string
    ): IDisposable {
        return this.on.service.add(bundle, listener, name, filter);
    }
    addBundleListener(bundle: IBundle, listener: IBundleListener): IDisposable {
        return this.on.bundle.add(bundle, listener);
    };
    addFrameworkListener(bundle: IBundle, listener: IFrameworkListener): IDisposable {
        return this.on.framework.add(bundle, listener);
    }
    removeServiceListener(bundle: IBundle, listener: IServiceListener): void {
        this.on.service.remove(bundle, listener);
    }
    removeBundleListener(bundle: IBundle, listener: IBundleListener): void {
        this.on.bundle.remove(bundle, listener);
    };
    removeFrameworkListener(bundle: IBundle, listener: IFrameworkListener): void {
        this.on.framework.remove(bundle, listener);
    }
}

function getActivator(module: IModule): IActivator {
    if (Object.prototype.hasOwnProperty.call(module, 'Activator')) {
        return new module.Activator();
    }
    const fn = async (ctx: BundleContext) => {};
    if (module.activate) {
        const activator = {
            start: async function(ctx: BundleContext) {
                activator.stop = (await module.activate(ctx)) || fn;
            },
            stop: fn,
        };
        return activator;
    }
    return {
        start: fn,
        stop: fn,
    };
}

export class FrameworkFactory {
    create(properties: any = {}): Framework {
        return new Framework(properties);
    }
}
