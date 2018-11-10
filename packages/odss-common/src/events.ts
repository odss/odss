import {IEvent, IServiceEvent, IBundleEvent, IFrameworkEvent, IBundle, IServiceReference} from './interfaces';


export class Event implements IEvent {

    public type: number;

    constructor(type: number) {
        this.type = type;
    }
    toString() {
        return '[Event type=' + this.type + ']';
    }
}

export class BundleEvent extends Event implements IBundleEvent {

    public bundle: IBundle;

    constructor(type: number, bundle: IBundle) {
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

export class ServiceEvent extends Event implements IServiceEvent {
    public readonly reference: IServiceReference;
    public readonly properties: any;

    constructor(type: number, reference: IServiceReference, properties:any = {}) {
        super(type);
        this.reference = reference;
        this.properties = properties;
        Object.freeze(this);
    }
    toString() {
        return '[ServiceEvent type=' + this.type + ' servie.name=' + this.reference + ']';
    }
}
