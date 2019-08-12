"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor(type) {
        this.type = type;
    }
    toString() {
        return '[Event type=' + this.type + ']';
    }
}
exports.Event = Event;
class BundleEvent extends Event {
    constructor(type, bundle) {
        super(type);
        this.bundle = bundle;
        Object.freeze(this);
    }
    toString() {
        return '[BundleEvent type=' + this.type + ' bundle.namespace=' + this.bundle.meta.namespace + ']';
    }
}
exports.BundleEvent = BundleEvent;
class FrameworkEvent extends BundleEvent {
    toString() {
        return '[FrameworkEvent type=' + this.type + ']';
    }
}
exports.FrameworkEvent = FrameworkEvent;
class ServiceEvent extends Event {
    constructor(type, reference, properties = {}) {
        super(type);
        this.reference = reference;
        this.properties = properties;
        Object.freeze(this);
    }
    toString() {
        return '[ServiceEvent type=' + this.type + ' servie.name=' + this.reference + ']';
    }
}
exports.ServiceEvent = ServiceEvent;
