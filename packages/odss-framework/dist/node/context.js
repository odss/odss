"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@odss/common");
class BundleContext {
    constructor(framework, bundle) {
        this.framework = framework;
        this.bundle = bundle;
        this.on = createEvents(framework, bundle);
        Object.freeze(this);
    }
    getProperty(name, def) {
        return this.framework.getProperty(name, def);
    }
    getProperties() {
        return this.framework.getProperties();
    }
    getBundle(bundleId) {
        return this.framework.getBundle(bundleId);
    }
    getBundles() {
        return this.framework.getBundles();
    }
    async installBundle(location, autoStart = false) {
        return await this.framework.installBundle(location, autoStart);
    }
    async uninstallBundle(bundle) {
        return await this.framework.uninstallBundle(bundle);
    }
    getServiceReferences(name, filter = '') {
        return this.framework.registry.findReferences(name, filter);
    }
    getServiceReference(name, filter = '') {
        return this.framework.registry.findReference(name, filter);
    }
    getService(reference) {
        return this.framework.registry.find(this.bundle, reference);
    }
    ungetService(reference) {
        return this.framework.registry.unget(this.bundle, reference);
    }
    registerService(name, service, properties) {
        return this.framework.registry.registerService(this.bundle, name, service, properties);
    }
    registerStyle(...styles) {
        return this.framework.registry.registerStyle(this.bundle, styles);
    }
    serviceTracker(name, listener, filter = '') {
        return new common_1.ServiceTracker(this, name, listener, filter);
    }
    bundleTracker(mask, listener) {
        return new common_1.BundleTracker(this, mask, listener);
    }
    onService(listener, name, filter = '') {
        // return this.framework.onService(listener, name, filter);
    }
    onBundle(listener) {
        // return this.framework.onBundle(listener);
    }
    onFramework(listener) {
        // return this.framework.onFramework(listener);
    }
}
exports.default = BundleContext;
function createEvents(framework, bundle) {
    return Object.freeze({
        service: createEvent(framework.on.service, bundle),
        bundle: createEvent(framework.on.bundle, bundle),
        framework: createEvent(framework.on.framework, bundle)
    });
}
;
function createEvent(dispacher, bundle) {
    return Object.freeze({
        add(listener, name, filter = '') {
            dispacher.add(bundle, listener, name, filter);
        },
        remove(listener) {
            dispacher.remove(bundle, listener);
        }
    });
}
