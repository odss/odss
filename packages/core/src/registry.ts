import { squery } from '@odss/query';
import {
    Events,
    ServiceEvent,
    IBundle,
    OBJECTCLASS,
    OBJECTCLASS_NAME,
    SERVICE_ID,
    SERVICE_RANKING,
    getTokenTypes,
    IServiceReference,
    IServiceRegistration,
    Properties,
} from '@odss/common';

type TServiceInfo = {
    sid: number;
    bid: number;
    clasess: string[];
    service: any;
    registration: ServiceRegistration;
    using: Set<number>;
    reference: ServiceReference;
};

const sortReferences = (ref1, ref2) => {
    return ref1.compare(ref2);

    // const [rank1, id1] = ref1.getSortValues();
    // const [rank2, id2] = ref2.getSortValues();
    // return rank1 - rank2 || id1 - id2;
};

export default class Registry {
    public events: any;
    private _services: Map<ServiceReference, TServiceInfo> = new Map();
    private _specs: Map<string, ServiceReference[]> = new Map();
    private _registrations: WeakMap<ServiceRegistration, ServiceReference> = new WeakMap();
    private _styles: any = {};
    private _size = 0;
    private _sid = 0;
    constructor(events) {
        this.events = events;
    }
    registerService(
        bundle: IBundle,
        clasess: any[],
        service: any,
        properties: Properties = {}
    ): IServiceRegistration {
        const sid = (this._sid += 1);
        this._size += 1;
        //prepare properties
        clasess = Array.isArray(clasess) ? clasess : [clasess];
        properties[OBJECTCLASS] = clasess;
        properties[OBJECTCLASS_NAME] = getTokenTypes(clasess);
        properties[SERVICE_ID] = sid;
        properties[SERVICE_RANKING] = properties[SERVICE_RANKING] || 0;

        const registration = new ServiceRegistration(this, bundle, sid, properties);
        const reference = registration.getReference();
        const bid = bundle.id;
        this._services.set(reference, {
            sid,
            bid,
            clasess,
            service,
            registration,
            using: new Set(),
            reference,
        });
        this._registrations.set(registration, reference);

        for (const token of clasess) {
            const refs = this._specs.get(token) || [];
            refs.push(reference);
            refs.sort(sortReferences);
            this._specs.set(token, refs);
        }
        this.events.service.fire(new ServiceEvent(Events.REGISTERED, registration.getReference()));
        return registration;
    }
    registerStyle(bundle: IBundle, styles: string[]) {
        let elements = styles.map(createStyle);
        this._styles[bundle.id] = () => {
            if (elements) {
                delete this._styles[bundle.id];
                removeStyles(elements);
                elements = null;
            }
        };
        return this._styles[bundle.id];
    }

    unregister(registration: ServiceRegistration) {
        const reference = this._registrations.get(registration);
        if (reference) {
            const info = this._services.get(reference);
            if (info) {
                const bundle = registration.getBundle();
                this.events.service.fire(new ServiceEvent(Events.UNREGISTERED, info.reference));
                if (info.using.size) {
                    throw new Error(
                        'Service: "' +
                            info.clasess +
                            '" from bundle (id=' +
                            info.bid +
                            ') is using by bundle(s): (id=' +
                            Array.from(info.using) +
                            ')'
                    );
                }
                this._services.delete(reference);
                this._registrations.delete(registration);

                for (const token of info.clasess) {
                    const refs = this._specs.get(token) || [];
                    const idx = refs.indexOf(reference);
                    refs.splice(idx, 1);
                    refs.sort(sortReferences);
                    this._specs.set(token, refs);
                }
                this._size -= 1;
                return true;
            }
        }
        return false;
    }

    unregisterAll(bundle) {
        const bid = bundle.id;
        for (const info of this._services.values()) {
            if (info.bid === bid) {
                this.unregister(info.registration);
            }
        }
        // if(this._styles[bid]){
        //     this._styles[bid]();
        // }
    }
    find(bundle, reference) {
        const info = this._services.get(reference);
        if (info) {
            info.using.add(bundle.id);
            reference.usedBy(bundle);
            return info.service;
        }
        return null;
    }
    unget(bundle, reference) {
        const info = this._services.get(reference);
        if (info) {
            info.using.delete(bundle.id);
        }
        reference.unusedBy(bundle);
    }

    ungetAll(bundle) {
        const bid = bundle.id;
        for (const info of this._services.values()) {
            if (info.using.has(bid)) {
                info.using.delete(bid);
                info.reference.unusedBy(bundle);
            }
        }
    }

    /**
     * @param {string} name
     * @param {(object|string)} filters
     * @return {odss.core.service.Reference}
     */
    findReference(name: any = null, filter: string = null): IServiceReference {
        const references = this._specs.get(name);
        if (references && references.length) {
            if (!filter) {
                return references[0];
            }
            const matcher = squery(filter);
            for (const reference of references) {
                if (matcher.match(reference.getProperties())) {
                    return reference;
                }
            }
        }
        return null;
    }
    findReferences(name: any = null, filter = ''): IServiceReference[] {
        if (name === null) {
            if (!filter) {
                return [...this._services.keys()];
            }
            const buff = [];
            for (const reference of this._services.keys()) {
                const matcher = squery(filter);
                if (matcher.match(reference.getProperties())) {
                    buff.push(reference);
                }
            }
            return buff;
        }
        const buff = [];
        const references = this._specs.get(name);
        if (references && references.length) {
            if (!filter) {
                return [...references];
            }
            const matcher = squery(filter);
            for (const reference of references) {
                if (matcher.match(reference.getProperties())) {
                    buff.push(reference);
                }
            }
        }
        return buff;
    }
    findBundleReferences(bundle) {
        const buff = [];
        const bundleId = bundle.id;
        for (const info of this._services.values()) {
            if (info.bid === bundleId) {
                buff.push(info.reference);
            }
        }
        return buff;
    }
    findBundleReferencesInUse(bundle) {
        const buff = [];
        const bundleId = bundle.id;
        for (const info of this._services.values()) {
            if (info.using.has(bundleId)) {
                buff.push(info.reference);
            }
        }
        return buff;
    }

    size() {
        return this._size;
    }
    updateProperties(registration: ServiceRegistration, oldProps: Properties) {
        const reference = registration.getReference();
        if (reference.checkSortValue()) {
            const specs = reference.getProperty(OBJECTCLASS);
            for (const token of specs) {
                const refs = this._specs.get(token);
                refs.sort(sortReferences);
                this._specs.set(token, refs);
            }
        }
        this.events.service.fire(new ServiceEvent(Events.MODIFIED, reference, oldProps));
    }
}

class ServiceReference implements IServiceReference {
    private _usingBundles: Set<IBundle> = new Set();
    private _sortValue: [number, number] = [0, 0];

    constructor(private _id: number, private _properties: any) {
        this.checkSortValue();
    }
    getProperty(key: string) {
        return this._properties[key];
    }
    getPropertyKeys(): string[] {
        return Object.keys(this._properties);
    }
    getProperties(): any {
        return { ...this._properties };
    }
    usingBundles(): IBundle[] {
        return [...this._usingBundles];
    }

    usedBy(bundle: IBundle): void {
        this._usingBundles.add(bundle);
    }
    unusedBy(bundle: IBundle): void {
        this._usingBundles.delete(bundle);
    }
    checkSortValue(): boolean {
        const sortValue = this._computeSortValue();
        if (this._sortValue !== sortValue) {
            this._sortValue = sortValue;
            return true;
        }
        return false;
    }
    compare(ref: ServiceReference): number {
        const [rank1, id1] = this._sortValue;
        const [rank2, id2] = ref._sortValue;
        return rank1 - rank2 || id1 - id2;
    }
    private _computeSortValue(): [number, number] {
        return [this._properties[SERVICE_RANKING], this._id];
    }
    toString() {
        const classes = this.getProperty(OBJECTCLASS).map(item => (item.name ? item.name : item));
        return `[Reference id=${this._id} classes=(${classes.join(',')})]`;
    }
}

class ServiceRegistration implements IServiceRegistration {
    private _reference = new ServiceReference(this._id, this._properties);

    constructor(
        private _registry: Registry,
        private _bundle: IBundle,
        private _id: number,
        private _properties: Properties
    ) {}
    getBundle(): IBundle {
        return this._bundle;
    }
    getReference(): ServiceReference {
        return this._reference;
    }
    unregister(): void {
        this._registry.unregister(this);
    }
    setProperties(properties: Properties): void {
        const oldProperties = { ...this._properties };

        const keys = Object.keys(properties);
        for (const forbiden of [OBJECTCLASS, SERVICE_ID]) {
            if (keys.includes(forbiden)) {
                delete properties[forbiden];
            }
        }

        let wasChange = false;
        for (const [key, value] of Object.entries(properties)) {
            if (this._properties[key] !== value) {
                this._properties[key] = value;
                wasChange = true;
            }
        }

        if (wasChange) {
            this._registry.updateProperties(this, oldProperties);
        }
    }
}

function removeStyles(elements) {
    if (document) {
        elements.map(element => document.head.removeChild(element));
    }
}

function createStyle(source: string): HTMLStyleElement {
    if (document) {
        const element = document.createElement('style') as HTMLStyleElement;
        element.setAttribute('type', 'text/css');
        element.innerHTML = source;
        document.head.appendChild(element);
        return element;
    }
}
