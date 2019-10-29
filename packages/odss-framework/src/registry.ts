import {Events, ServiceEvent, IBundle, OBJECTCLASS, SERVICE_ID} from '@odss/common';
import {functionNames, prepareFilter} from './utils';

interface IRegistration {
    readonly id: number;
}


export default class Registry {
    public events: any;
    private _services: any = {};
    private _styles: any = {};
    private _size: number = 0;
    private _sid: number = 0;
    constructor(events) {
        this.events = events;
    }
    registerService(bundle: IBundle, name: any, service: any, properties: any) {
        name = functionNames(name);

        //prepare properties
        let sid = this._sid += 1;
        this._size += 1;
        properties = properties || {};
        properties[OBJECTCLASS] = name;
        properties[SERVICE_ID] = sid;

        let registration = new Registration(this, bundle, sid, properties);
        let bid = bundle.id;
        this._services[sid] = {
            sid,
            bid,
            name,
            service,
            properties,
            registration,
            using: new Set(),
            reference: registration.reference,
        };

        this.events.service.fire(new ServiceEvent(Events.REGISTERED, registration.reference));
        return registration;
    }
    registerStyles(bundle: IBundle, styles: string[]) {
        let elements = styles.map(createStyle);
        this._styles[bundle.id] = () => {
            if(elements){
                delete this._styles[bundle.id];
                removeStyles(elements);
                elements = null;
            };
        };
        return this._styles[bundle.id];
    }

    unregister(bundle: IBundle, registration: IRegistration) {
        if (registration instanceof Registration) {
            let sid = registration.id;
            if (sid in this._services) {
                let opts = this._services[sid];
                if (opts.bid === bundle.id) {
                    this.events.service.fire(new ServiceEvent(Events.UNREGISTERED, opts.reference));
                    if (opts.using.size) {
                        throw new Error('Service: "' + opts.name + '" from bundle (id=' + opts.bid + ') is using by budle(s): (id=' + Array.from(opts.using) + ')');
                    }
                    delete this._services[sid];
                    this._size -= 1;
                    return true;
                } else {
                    throw new Error('Bundle (id=' + bundle.id + ') try remove service: "' + opts.name + '" registered by bundle (id=' + opts.bid + ')');
                }
            }
        }
        return false;
    }

    unregisterAll(bundle) {
        let bid = bundle.id;
        for (let sid of Object.keys(this._services)) {
            if (this._services[sid].bid === bid) {
                this.unregister(bundle, this._services[sid].registration);
            }
        }
        if(this._styles[bid]){
            this._styles[bid]();
        }
    }
    find(bundle, reference) {
        let sid = reference.id;
        if (sid in this._services) {
            this._services[sid].using.add(bundle.id);
            return this._services[sid].service;
        }
        return null;
    }
    unget(bundle, reference) {
        let sid = reference.id;
        if (sid in this._services) {
            this._services[sid].using.delete(bundle.id);
        }
    }

    ungetAll(bundle) {
        let bid = bundle.id;
        for (let sid in this._services) {
            this._services[sid].using.delete(bid);
        }
    }

    /**
     * @param {string} name
     * @param {(object|string)} filters
     * @return {odss.core.service.Reference}
     */
    findReference(name: any, filter:string = null) {
        filter = prepareFilter(name, filter);
        for (let sid in this._services) {
            if (filter.match(this._services[sid].properties)) {
                return this._services[sid].reference;
            }
        }
        return null;
    }
    /**
     * @param {string} name
     * @param {(object|string)} filters
     * @return {Array} Return list of references
     */
    findReferences(name: any, filter:string = '') {
            filter = prepareFilter(name, filter);
            let buff = [];
            for (let sid in this._services) {
                if (filter.match(this._services[sid].properties)) {
                    buff.push(this._services[sid].reference);
                }
            }
            return buff;
        }
        /**
         * @param {odss.core.Bundle} bundle
         * @return {Array} bundle Retrun list of references
         */
    findBundleReferences(bundle) {
        let buff = [];
        let bid = bundle.id;
        for (let sid in this._services) {
            if (this._services[sid].bid === bid) {
                buff.push(this._services[sid].reference);
            }
        }
        return buff;
    }
    findBundleReferencesInUse(bundle) {
        let buff = [];
        let bid = bundle.id;
        for (let sid in this._services) {
            if (this._services[sid].using.has(bid)) {
                buff.push(this._services[sid].reference);
            }
        }
        return buff;
    }

    size() {
        return this._size;
    }
    updateProperties(registration, oldProps) {
        this.events.service.fire(new ServiceEvent(Events.MODIFIED, registration.reference, oldProps));
    }

}

/**
 * @type {odss.core/service/Registration}
 */
function Registration(registry: Registry, bundle: IBundle, id: number, properties: object) {

    properties = Object.freeze(properties);

    let reference = Object.create(null, {
        id: {
            value: id,
            enumerable: true
        },
        bundle: {
            value: bundle,
            enumerable: true
        }
    });
    reference.getProperties = () => properties;
    reference.getProperty = name => name in properties ? properties[name] : null;
    reference.toString = () => 'odss.service.Reference(id=' + id + ')';

    Object.defineProperties(this, {
        id: {
            value: id,
            enumerable: true
        },
        reference: {
            value: reference,
            enumerable: true
        }
    });
    this.unregister = function() {
        registry.unregister(bundle, this);
        return this;
    };

    this.update = function(name, value) {
        let oldProps = properties;
        properties = Object.assign({}, properties);
        properties[name] = value;
        Object.freeze(properties);
        registry.updateProperties(this, oldProps);
    };

    /**
     *
     * @param {Object} newProperties
     */
    this.updateAll = function(newProperties) {
        let oldProps = properties;
        properties = Object.assign({}, properties);
        for (let i in newProperties) {
            if (newProperties.hasOwnProperty(i)) {
                properties[i] = newProperties;
            }
        }
        Object.freeze(properties);
        registry.updateProperties(this, oldProps);
    };

    this.toString = function() {
        return 'odss.core/service/Registration(id=' + id + ')';
    };
};

function removeStyles(elements) {
    if (document) {
    	elements.map(
            element => document.head.removeChild(element)
        );
    }
}

function createStyle(source: string): HTMLStyleElement {
    if (document){
    	let element = document.createElement('style') as HTMLStyleElement;
    	element.setAttribute('type', 'text/css')
    	element.innerHTML = source
    	document.head.appendChild(element);
    	return element;
    }
}