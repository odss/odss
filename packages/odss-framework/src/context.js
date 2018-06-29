import { ServiceTracker, BundleTracker } from 'odss-common';
import { prepareFilter } from './utils';
export default class BundleContext {
    constructor(framework, bundle) {
        this.framework = framework;
        this.bundle = bundle;
        this.on = createEvents(framework, bundle);
        Object.freeze(this);
    }
    property(name, def) {
        return this.framework.property(name, def);
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
    getServiceReferences(name, filter) {
        return this.framework.registry.findReferences(name, filter);
    }
    getServiceReference(name, filter) {
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
    styles(...styles) {
        return this.framework.registry.registerStyles(this.bundle, styles);
    }
    serviceTracker(name, listener, filter = null) {
        return new ServiceTracker(this, prepareFilter(name, filter), listener);
    }
    bundleTracker(mask, listener) {
        return new BundleTracker(this, mask, listener);
    }
    onService(listener, name, filter = '') {
        return this.framework.onService(listener, name, filter);
    }
    onBundle(listener) {
        return this.framework.onBundle(listener);
    }
    onFramework(listener) {
        return this.framework.onFramework(listener);
    }
}
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
        add(listener, filter) {
            dispacher.add(bundle, listener, filter);
        },
        remove(listener) {
            dispacher.remove(bundle, listener);
        }
    });
}
