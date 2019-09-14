import { Events, Bundles, FrameworkEvent, ServiceEvent, BundleEvent } from '@odss/common';
import Bundle from './bundle';
import BundleContext from './context';
import { createDefaultLoader } from './loader';
import Registry from './registry';
import EventDispatcher from './events';
export class Framework extends Bundle {
    constructor(properties = {}) {
        super(0, null, {
            location: 'odss.framework'
        });
        this._SID = 0;
        this._loader = null;
        this._bundles = new Map();
        this._activators = new Map();
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
    getProperty(name, defaultProperty) {
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
        return Object.assign({}, this._properties);
    }
    async start() {
        if (this.state === Bundles.ACTIVE || this.state === Bundles.STARTING) {
            return;
        }
        if (this.state === Bundles.STOPPING) {
            throw new Error('Cannot start stoping bundle');
        }
        this._fireBundleEvent(Events.STARTING, this);
        this.updateState(Bundles.ACTIVE);
        for (let [id, bundle] of this._bundles.entries()) {
            //framework bundle
            if (id === 0) {
                continue;
            }
            try {
                await this.startBundle(bundle);
            }
            catch (e) {
                console.error(`Problem with start a bundle: ${bundle.meta.location}`, e);
            }
        }
        this._fireBundleEvent(Events.STARTED, this);
    }
    async stop() {
        if (this.state !== Bundles.ACTIVE) {
            return;
        }
        this.updateState(Bundles.STOPPING);
        this._fireBundleEvent(Events.STOPPING, this);
        this.updateState(Bundles.RESOLVED);
        for (let bundle of this._bundles.values()) {
            try {
                await this.stopBundle(bundle);
            }
            catch (e) {
                console.error(`Problem with stop a bundle: ${bundle.meta.location}`, e);
            }
        }
        this._fireBundleEvent(Events.STOPPED, this);
    }
    async uninstall() {
        throw new Error('Not allowed uninstall framework');
    }
    async update() {
        if (this.state === Bundles.ACTIVE) {
            await this.stop();
            await this.start();
            this._fireFrameworkEvent(Events.UPDATED);
        }
    }
    setLoader(loader) {
        this._loader = loader;
    }
    getLoader() {
        if (this._loader === null) {
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
        }
        else if (typeof bundleId === 'string') {
            for (let bundle of this._bundles.values()) {
                if (bundle.meta.location === bundleId) {
                    return true;
                }
            }
        }
        return false;
    }
    getBundle(obj) {
        if (typeof obj === 'number') {
            if (this._bundles.has(obj)) {
                return this._bundles.get(obj);
            }
            throw new Error('Not found: Bundle(id=' + obj + ')');
        }
        else if (typeof obj === 'string') {
            for (let bundle of this._bundles.values()) {
                if (bundle.meta.location === obj) {
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
    async installBundle(location, autostart) {
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
    async startBundle(bundle) {
        if (bundle.id === 0) {
            throw new Error('Cannot start framework bundle: ' + bundle.meta.location);
        }
        let state = bundle.state;
        if (state === Bundles.ACTIVE) {
            console.warn(`'Bundle: ${bundle.meta.location} already active`);
            return true;
        }
        if (state === Bundles.STARTING) {
            throw new Error('Bundle ' + bundle.meta.location + ' cannot be started, since it is stopping');
        }
        if (state === Bundles.UNINSTALLED) {
            throw new Error('Cannot start uninstalled bundle: ' + bundle.meta.location);
        }
        bundle.setContext(new BundleContext(this, bundle));
        bundle.updateState(Bundles.STARTING);
        this._fireBundleEvent(Events.STARTING, bundle);
        try {
            const activator = this._activators.get(bundle.id);
            await activator.start(bundle.context);
            bundle.updateState(Bundles.ACTIVE);
            this._fireBundleEvent(Events.STARTED, bundle);
        }
        catch (e) {
            bundle.unsetContext();
            bundle.updateState(state);
            this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.removeAll(bundle);
            throw e;
        }
    }
    async stopBundle(bundle) {
        if (bundle.id === 0) {
            throw new Error('Cannot stop framework bundle: ' + bundle.meta.location);
        }
        let state = bundle.state;
        if (state === Bundles.UNINSTALLED) {
            throw new Error('Cannot stop uninstalled bundle: ' + bundle.meta.location);
        }
        if (state === Bundles.STOPPING) {
            throw new Error('Bundle: ' + bundle.meta.location + ' cannot be stopped since it is already stopping');
        }
        if (state !== Bundles.ACTIVE) {
            return true;
        }
        bundle.updateState(Bundles.STOPPING);
        this._fireBundleEvent(Events.STOPPING, bundle);
        try {
            const activator = this._activators.get(bundle.id);
            await activator.stop(bundle.context);
            await this.getLoader().unloadBundle(bundle.meta.location);
            bundle.unsetContext();
            bundle.updateState(Bundles.RESOLVED);
            this.registry.unregisterAll(bundle);
            this.registry.ungetAll(bundle);
            this.on.removeAll(bundle);
            this._fireBundleEvent(Events.STOPPED, bundle);
        }
        catch (e) {
            bundle.updateState(state);
            console.error(`Activator stop error in : ${bundle.meta.location}`, e);
            return false;
        }
        return true;
    }
    async reloadBundle(bundle, autostart) {
        if (await this.uninstallBundle(bundle)) {
            await this.installBundle(bundle.meta.location, autostart);
        }
    }
    async uninstallBundle(bundle) {
        await sleep();
        if (bundle.id === 0) {
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
    _fireBundleEvent(type, bundle) {
        if (this === bundle) {
            this.on.framework.fire(new FrameworkEvent(type, bundle));
        }
        this.on.bundle.fire(new BundleEvent(type, bundle));
    }
    _fireServiceEvent(type, ref) {
        this.on.service.fite(new ServiceEvent(type, ref));
    }
    _fireFrameworkEvent(type) {
        this.on.framework.fire(new FrameworkEvent(type, this));
    }
}
function getActivator(config) {
    if (config.hasOwnProperty('Activator')) {
        return new config.Activator();
    }
    const fn = () => { };
    const start = config.start || fn;
    const stop = config.stop || fn;
    return {
        start,
        stop
    };
}
export class FrameworkFactory {
    /**
     * Create a new Framework instance.
     * @param {Object} config
     * @return New configured Framework
     */
    create(config) {
        let frame = new Framework(config);
        // if (config.path) {
        //     frame.getLoader().setPath(config.path);
        // }
        return frame;
    }
}
function sleep() {
    return new Promise(resolve => {
        setTimeout(resolve);
    });
}
