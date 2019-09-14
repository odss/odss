"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@odss/common");
const utils_1 = require("./utils");
class Registry {
    constructor(events) {
        this._services = {};
        this._styles = {};
        this._size = 0;
        this._sid = 0;
        this.events = events;
    }
    registerService(bundle, name, service, properties) {
        name = utils_1.functionNames(name);
        //prepare properties
        let sid = this._sid += 1;
        this._size += 1;
        properties = properties || {};
        properties[common_1.OBJECTCLASS] = name;
        properties[common_1.SERVICE_ID] = sid;
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
        this.events.service.fire(new common_1.ServiceEvent(common_1.Events.REGISTERED, registration.reference));
        return registration;
    }
    registerStyle(bundle, styles) {
        let elements = styles.map(createStyle);
        this._styles[bundle.id] = () => {
            if (elements) {
                delete this._styles[bundle.id];
                removeStyles(elements);
                elements = null;
            }
            ;
        };
        return this._styles[bundle.id];
    }
    unregister(bundle, registration) {
        if (registration instanceof Registration) {
            let sid = registration.id;
            if (sid in this._services) {
                let opts = this._services[sid];
                if (opts.bid === bundle.id) {
                    this.events.service.fire(new common_1.ServiceEvent(common_1.Events.UNREGISTERED, opts.reference));
                    if (opts.using.size) {
                        throw new Error('Service: "' + opts.name + '" from bundle (id=' + opts.bid + ') is using by budle(s): (id=' + Array.from(opts.using) + ')');
                    }
                    delete this._services[sid];
                    this._size -= 1;
                    return true;
                }
                else {
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
        if (this._styles[bid]) {
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
    findReference(name, filter = null) {
        filter = utils_1.prepareFilter(name, filter);
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
    findReferences(name, filter = '') {
        filter = utils_1.prepareFilter(name, filter);
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
        this.events.service.fire(new common_1.ServiceEvent(common_1.Events.MODIFIED, registration.reference, oldProps));
    }
}
exports.default = Registry;
/**
 * @type {odss.core/service/Registration}
 */
function Registration(registry, bundle, id, properties) {
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
    this.unregister = function () {
        registry.unregister(bundle, this);
        return this;
    };
    this.update = function (name, value) {
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
    this.updateAll = function (newProperties) {
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
    this.toString = function () {
        return 'odss.core/service/Registration(id=' + id + ')';
    };
}
;
function removeStyles(elements) {
    if (document) {
        elements.map(element => document.head.removeChild(element));
    }
}
function createStyle(source) {
    if (document) {
        let element = document.createElement('style');
        element.setAttribute('type', 'text/css');
        element.innerHTML = source;
        document.head.appendChild(element);
        return element;
    }
}
