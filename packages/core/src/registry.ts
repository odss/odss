import { squery } from '@odss/query';
import {
    Events,
    ServiceEvent,
    IBundle,
    OBJECTCLASS,
    SERVICE_ID,
    SERVICE_RANKING,
    getTokenTypes,
    getTokenType,
    IServiceReference,
    IServiceRegistration,
    Properties,
} from '@odss/common';
import { ServiceReference } from './base';

type TServiceInfo = {
    sid: number;
    bid: number;
    clasess: string[];
    service: any;
    registration: ServiceRegistration;
    using: Set<number>;
    reference: ServiceReference;
};

const sortReferences = (ref1: IServiceReference, ref2: IServiceReference) => {
    return ref1.compare(ref2);

    // const [rank1, id1] = ref1.getSortValues();
    // const [rank2, id2] = ref2.getSortValues();
    // return rank1 - rank2 || id1 - id2;
};

export default class Registry {
    private _services: Map<IServiceReference, TServiceInfo> = new Map();
    private _registrations: WeakMap<ServiceRegistration, IServiceReference> = new WeakMap();
    private _specs: Map<string, IServiceReference[]> = new Map();
    private _size = 0;
    private _sid = 0;
    constructor(public events: any) {}
    async registerService(
        bundle: IBundle,
        clasess: any[],
        service: any,
        properties: Properties = {}
    ): Promise<IServiceRegistration> {
        const sid = (this._sid += 1);
        this._size += 1;
        //prepare properties
        clasess = getTokenTypes(clasess);
        // clasess = Array.isArray(clasess) ? clasess : [clasess];
        properties[OBJECTCLASS] = clasess;
        // properties[OBJECTCLASS_NAME] = getTokenTypes(clasess);
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
        await this.events.service.fire(
            new ServiceEvent(Events.REGISTERED, registration.getReference())
        );
        return registration;
    }

    async unregister(registration: ServiceRegistration): Promise<boolean> {
        const reference = this._registrations.get(registration);
        if (reference) {
            const info = this._services.get(reference);
            if (info) {
                await this.events.service.fire(
                    new ServiceEvent(Events.UNREGISTERED, info.reference)
                );
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

    async unregisterAll(bundle: IBundle): Promise<void> {
        const bid = bundle.id;
        for (const info of this._services.values()) {
            if (info.bid === bid) {
                await this.unregister(info.registration);
            }
        }
    }
    find(bundle: IBundle, reference: IServiceReference): any | null {
        const info = this._services.get(reference);
        if (info) {
            info.using.add(bundle.id);
            (reference as ServiceReference).usedBy(bundle);
            return info.service;
        }
        return null;
    }
    unget(bundle: IBundle, reference: IServiceReference): void {
        const info = this._services.get(reference);
        if (info) {
            info.using.delete(bundle.id);
        }
        (reference as ServiceReference).unusedBy(bundle);
    }

    ungetAll(bundle: IBundle): void {
        const bid = bundle.id;
        for (const info of this._services.values()) {
            if (info.using.has(bid)) {
                info.using.delete(bid);
                (info.reference as ServiceReference).unusedBy(bundle);
            }
        }
    }

    findReference(name: any = null, filter: string = null): IServiceReference {
        const references = this._specs.get(getTokenType(name));
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
        const references = this._specs.get(getTokenType(name));
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
    findBundleReferences(bundle: IBundle): IServiceReference[] {
        const buff: IServiceReference[] = [];
        const bundleId = bundle.id;
        for (const info of this._services.values()) {
            if (info.bid === bundleId) {
                buff.push(info.reference);
            }
        }
        return buff;
    }
    findBundleReferencesInUse(bundle: IBundle): IServiceReference[] {
        const buff: IServiceReference[] = [];
        const bundleId = bundle.id;
        for (const info of this._services.values()) {
            if (info.using.has(bundleId)) {
                buff.push(info.reference);
            }
        }
        return buff;
    }

    size(): number {
        return this._size;
    }
    async updateProperties(registration: ServiceRegistration, oldProps: Properties): Promise<void> {
        const reference = registration.getReference() as ServiceReference;
        if (reference.checkSortValue()) {
            const specs = reference.getProperty(OBJECTCLASS);
            for (const token of specs) {
                const refs = this._specs.get(token);
                refs.sort(sortReferences);
                this._specs.set(token, refs);
            }
        }
        await this.events.service.fire(new ServiceEvent(Events.MODIFIED, reference, oldProps));
    }
}

class ServiceRegistration implements IServiceRegistration {
    private _reference: IServiceReference;

    constructor(
        private _registry: Registry,
        private _bundle: IBundle,
        private _id: number,
        private _properties: Properties
    ) {
        this._reference = new ServiceReference(this._id, this._properties);
    }
    getBundle(): IBundle {
        return this._bundle;
    }
    getReference(): IServiceReference {
        return this._reference;
    }
    async unregister(): Promise<void> {
        this._registry.unregister(this);
    }
    async setProperties(properties: Properties): Promise<void> {
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
            await this._registry.updateProperties(this, oldProperties);
        }
    }
}

