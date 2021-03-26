import {ILoader, IBundle, Events, Bundles, FrameworkEvent, ServiceEvent, BundleEvent, IBundleContext, IServiceReference} from '@odss/common';
import Bundle from './bundle';
import BundleContext from './context';
import { createDefaultLoader } from './loader';
import Registry from './registry';
import EventDispatcher from './events';

const FRAMEWORK_ID = 0

export class Framework implements IBundle {

    readonly id: number = FRAMEWORK_ID;
    readonly location: string = 'odss.framework';
    readonly version: string = '0.0.0';
    readonly meta: any = {};

    context: IBundleContext;
    state: number = Bundles.INSTALLED;

    private _SID: number = 0;
    private _loader?: ILoader;
    private _bundles: Map<number, IBundle> = new Map();
    private _properties: any = {};
    private _activators: Map<number, any> = new Map();
    public on: EventDispatcher;
    public registry: Registry;

    constructor(properties: any = {}) {
        this._properties = properties;
        this._bundles.set(this.id, this);
        this.on = new EventDispatcher();
        this.registry = new Registry(this.on);
    }

    nextSid() {
        return this._SID += 1;
    }
    /**
     * Return selectede property
     *
     * @param {String} name
     * @param {Object} def Default value
     */
    getProperty(name, defaultProperty = undefined) {
        if (this._properties.hasOwnProperty(name)) {
            return this._properties[name];
        }
        if (typeof defaultProperty !== 'undefined') {
            return defaultProperty;
        }
        return null;
    }
        /**
         * @return {Object}
         */
    getProperties() {
        return { ...this._properties };
    }
    async start() {
        if (this.state === Bundles.ACTIVE || this.state === Bundles.STARTING) {
            return;
        }
        if (this.state === Bundles.STOPPING) {
            throw new Error('Cannot start stoping bundle');
        }
        this._fireBundleEvent(Events.STARTING, this);
        this.state = Bundles.ACTIVE;
        for (let [id, bundle] of this._bundles.entries()) {
            //framework bundle
            if(id === 0){
                continue;
            }
            try {
                await this.startBundle(bundle);
            } catch (e) {
                console.error(`Problem with start a bundle: ${bundle.location}`, e);
            }
        }
        this._fireBundleEvent(Events.STARTED, this);
    }
    async stop() {
        if (this.state !== Bundles.ACTIVE) {
            return;
        }
        this.state = Bundles.STOPPING;
        this._fireBundleEvent(Events.STOPPING, this);

        this.state = Bundles.RESOLVED;
        const bundles = Array.from(this._bundles.values()).reverse();
        for (const bundle of bundles) {
            if (bundle.id === FRAMEWORK_ID) {
                continue;
            }
            try {
                await this.stopBundle(bundle);
            } catch (e) {
                console.error(`Problem with stop a bundle: ${bundle.location}`, e);
            }
        }
        this._fireBundleEvent(Events.STOPPED, this);
    }
    async uninstall(): Promise<void> {
        throw new Error('Not allowed uninstall framework.');
    }
    reload(): Promise<void> {
        throw new Error("Not allowed reload framework");
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
            for (let bundle of this._bundles.values()) {
                if (bundle.location === bundleId) {
                    return true;
                }
            }
        }
        return false;
    }
    getBundle(obj: any) {
        if (typeof obj === 'number') {
            if (this._bundles.has(obj)) {
                return this._bundles.get(obj);
            }
            throw new Error('Not found: Bundle(id=' + obj + ')');
        } else if (typeof obj === 'string') {
            for (let bundle of this._bundles.values()) {
                if (bundle.location === obj) {
                    return bundle;
                }
            }
            throw new Error('Not found: Bundle(location=' + obj + ')');
        }
        throw new Error('Incorect bundle identifier: ' + obj);
    }
    getBundles() {
        return Array.from(this._bundles.values());
    }

    async installBundle(location: string, autostart: boolean = true) {
        let config = await this.getLoader().loadBundle(location);
        let bundle = new Bundle(this.nextSid(), this, config);
        this._bundles.set(bundle.id, bundle);
        this._activators.set(bundle.id, getActivator(config));
        this._fireBundleEvent(Events.INSTALLED, bundle);
        if (autostart) {
            await bundle.start();
        }
        return bundle;
    }

    async startBundle(bundle: IBundle) {
        if (bundle.id === FRAMEWORK_ID) {
            throw new Error('Cannot start framework bundle: ' + bundle.location);
        }
        let state = bundle.state;

        if (state === Bundles.ACTIVE) {
            console.warn(`'Bundle: ${bundle.location} already active`);
            return true;
        }
        if (state === Bundles.STARTING) {
            throw new Error('Bundle ' + bundle.location + ' cannot be started, since it is stopping');
        }
        if (state === Bundles.UNINSTALLED) {
            throw new Error('Cannot start uninstalled bundle: ' + bundle.location);
        }

        (bundle as Bundle).setContext(new BundleContext(this, bundle));
        (bundle as Bundle).updateState(Bundles.STARTING);
        this._fireBundleEvent(Events.STARTING, bundle);

        try {
            const activator = this._activators.get(bundle.id);
            await activator.start(bundle.context);
            (bundle as Bundle).updateState(Bundles.ACTIVE);
            this._fireBundleEvent(Events.STARTED, bundle);
        } catch (e) {
            (bundle as Bundle).unsetContext();
            (bundle as Bundle).updateState(state);
            this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.removeAll(bundle);
            throw e;
        }
    }
    async stopBundle(bundle: IBundle) {
        if (bundle.id === FRAMEWORK_ID) {
            throw new Error('Cannot stop framework bundle: ' + bundle.location);
        }
        let state = bundle.state;

        if (state === Bundles.UNINSTALLED) {
            throw new Error('Cannot stop uninstalled bundle: ' + bundle.location);
        }
        if (state === Bundles.STOPPING) {
            throw new Error('Bundle: ' + bundle.location + ' cannot be stopped since it is already stopping');
        }

        if (state !== Bundles.ACTIVE) {
            return true;
        }

        (bundle as Bundle).updateState(Bundles.STOPPING);
        this._fireBundleEvent(Events.STOPPING, bundle);
        try {
            const activator = this._activators.get(bundle.id);
            await activator.stop(bundle.context);
            await this.getLoader().unloadBundle(bundle.location);
            (bundle as Bundle).unsetContext();
            (bundle as Bundle).updateState(Bundles.RESOLVED);
            this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.removeAll(bundle);
            this._fireBundleEvent(Events.STOPPED, bundle);
        } catch (e) {
            (bundle as Bundle).updateState(state);
            console.error(`Activator stop error in : ${bundle.location}`, e);
            return false;
        }
        return true;
    }

    async reloadBundle(bundle: Bundle, autostart: boolean) {
        if (await this.uninstallBundle(bundle)) {
            await this.installBundle(bundle.meta.location, autostart);
        }

    }
    async uninstallBundle(bundle: Bundle) {
        await sleep();
        if (bundle.id === FRAMEWORK_ID) {
            console.error(`Cannot uninstall main bundle: ${bundle.meta.location}`);
            return false;
        }
        if (bundle.state !== Bundles.UNINSTALLED) {
            let bundles = this._bundles;
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
    _fireBundleEvent(type: number, bundle: IBundle) {
        if (this === bundle) {
            this.on.framework.fire(new FrameworkEvent(type, bundle));
        }
        this.on.bundle.fire(new BundleEvent(type, bundle));
    }
    _fireServiceEvent(type: number, ref: any) {
        this.on.service.fite(new ServiceEvent(type, ref));
    }
    _fireFrameworkEvent(type: number) {
        this.on.framework.fire(new FrameworkEvent(type, this));
    }
    getRegisteredServices(): IServiceReference[] {
        return [];
    }
    getServicesInUse(): IServiceReference[] {
        return [];
    }
}

function getActivator(config) {
    if(config.hasOwnProperty('Activator')){
        return new config.Activator();
    }
    const fn = () => {};
    const start = config.start || fn;
    const stop = config.stop || fn;
    return {
        start,
        stop
    };
}

export class FrameworkFactory {

    create(properties: any = {}): Framework{
        return new Framework(properties);
    }
}


function sleep(){
    return Promise.resolve();
}