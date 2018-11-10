export class Event {
    constructor(type) {
        this.type = type;
    }
    toString() {
        return '[Event type=' + this.type + ']';
    }
}
export class BundleEvent extends Event {
    constructor(type, bundle) {
        super(type);
        this.bundle = bundle;
        Object.freeze(this);
    }
    toString() {
        return '[BundleEvent type=' + this.type + ' bundle.namespace=' + this.bundle.meta.namespace + ']';
    }
}
export class FrameworkEvent extends BundleEvent {
    toString() {
        return '[FrameworkEvent type=' + this.type + ']';
    }
}
export class ServiceEvent extends Event {
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
