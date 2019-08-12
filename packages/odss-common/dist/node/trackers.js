"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("./consts");
class ServiceTracked {
    constructor(customizer) {
        this.tracked = new Map();
        this.customizer = customizer;
    }
    serviceEvent(event) {
        switch (event.type) {
            case consts_1.Events.REGISTERED:
            case consts_1.Events.MODIFIED:
                this.track(event.reference);
                break;
            case consts_1.Events.UNREGISTERED:
                this.untrack(event.reference);
                break;
        }
    }
    track(reference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference);
            this.modified(reference, service);
        }
        else {
            const service = this.adding(reference);
            if (service) {
                this.tracked.set(reference, service);
            }
        }
    }
    untrack(reference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference);
            this.tracked.delete(reference);
            this.removed(reference, service);
        }
    }
    close() {
        let items = Array.from(this.tracked.keys());
        for (let item of items) {
            this.untrack(item);
        }
    }
    adding(reference) {
        return this.customizer.adding(reference);
    }
    modified(reference, service) {
        this.customizer.modified(reference, service);
    }
    removed(reference, service) {
        this.customizer.removed(reference, service);
    }
    size() {
        return this.tracked.size;
    }
    getServices() {
        return Array.from(this.tracked.values());
    }
    getReferences() {
        return Array.from(this.tracked.keys());
    }
}
class ServiceTracker {
    constructor(ctx, name, listener, filter) {
        if (!ctx) {
            throw new Error('Not set bundle context');
        }
        if (!name) {
            throw new Error('Not set name');
        }
        this._ctx = ctx;
        this._name = name;
        this._filter = filter;
        this._listener = listener;
    }
    open() {
        if (!this._tracked) {
            this._tracked = new ServiceTracked(this);
            this._ctx.on.service.add(this._tracked, this._name, this._filter);
            let refs = this._ctx.getServiceReferences(this._name, this._filter);
            for (let i = 0, j = refs.length; i < j; i++) {
                this._tracked.track(refs[i]);
            }
        }
        return this;
    }
    close() {
        if (this._tracked) {
            this._ctx.on.service.remove(this._tracked);
            this._tracked.close();
            this._tracked = undefined;
        }
        return this;
    }
    adding(reference) {
        const service = this._ctx.getService(reference);
        if (this._listener && this._listener.addingService) {
            this._listener.addingService(reference, service);
        }
        return service;
    }
    modified(reference, service) {
        if (this._listener && this._listener.modifiedService) {
            this._listener.modifiedService(reference, service);
        }
    }
    removed(reference, service) {
        if (this._listener && this._listener.removedService) {
            this._listener.removedService(reference, service);
        }
        this._ctx.ungetService(reference);
    }
    size() {
        return this._tracked ? this._tracked.size() : 0;
    }
    getReference() {
        return this.getReferences()[0];
    }
    getReferences() {
        return this._tracked ? this._tracked.getReferences() : [];
    }
    getService() {
        return this.getServices()[0];
    }
    getServices() {
        return this._tracked ? this._tracked.getServices() : [];
    }
    _extendCustomizer(customizer) {
        if (customizer) {
        }
    }
}
exports.ServiceTracker = ServiceTracker;
class BundleTracked {
    constructor(mask, listener = null) {
        this.listener = listener;
        this.mask = mask;
        this.bundles = new Set();
    }
    bundleEvent(event) {
        if (event.bundle.state & this.mask) {
            this.track(event.bundle);
        }
        else {
            this.untrack(event.bundle);
        }
    }
    track(bundle) {
        if (this.bundles.has(bundle)) {
            this.modified(bundle);
        }
        else {
            this.bundles.add(bundle);
            this.adding(bundle);
        }
    }
    untrack(bundle) {
        if (this.bundles.has(bundle)) {
            this.bundles.delete(bundle);
            this.removed(bundle);
        }
    }
    size() {
        return this.bundles.size;
    }
    close() {
        this.bundles.clear();
    }
    getBundles() {
        return Array.from(this.bundles);
    }
    removed(bundle) {
        if (this.listener !== null) {
            this.listener.removedBundle(bundle);
        }
    }
    adding(bundle) {
        if (this.listener !== null) {
            this.listener.addingBundle(bundle);
        }
    }
    modified(bundle) {
        if (this.listener !== null) {
            this.listener.modifiedBundle(bundle);
        }
    }
}
/**
 * @type {tracker.BundleTracker}
 * @constructor
 */
class BundleTracker {
    constructor(ctx, mask, listener) {
        this._ctx = ctx;
        if (!mask) {
            throw new Error('Not set mask for bundles');
        }
        this.mask = mask;
        this._listener = listener;
    }
    open() {
        if (!this._tracked) {
            this._tracked = new BundleTracked(this.mask, this._listener || this);
            this._ctx.on.bundle.add(this._tracked);
            let bundles = this._ctx.getBundles();
            for (let i = 0, j = bundles.length; i < j; i++) {
                if (bundles[i].state && this.mask) {
                    this._tracked.track(bundles[i]);
                }
            }
        }
        return this;
    }
    close() {
        if (this._tracked) {
            this._ctx.on.bundle.remove(this._tracked);
            this._tracked.close();
            this._tracked = undefined;
        }
        return this;
    }
    size() {
        return this._tracked ? this._tracked.size() : 0;
    }
    bundles() {
        return this._tracked ? this._tracked.getBundles() : [];
    }
    addingBundle(bundle) {
    }
    modifiedBundle(bundle) {
    }
    removedBundle(bundle) {
    }
}
exports.BundleTracker = BundleTracker;
