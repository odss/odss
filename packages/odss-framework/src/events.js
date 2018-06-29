import { FrameworkEvent, ServiceEvent, BundleEvent } from 'odss-common';
import { prepareFilter } from './utils';
function createListeners(callbackName) {
    let listeners = [];
    return {
        contains(bundle, listener) {
            for (let info of listeners) {
                if (info[0] === bundle && info[1] === listener) {
                    return true;
                }
            }
            return false;
        },
        size() {
            return listeners.length;
        },
        remove(bundle, listener) {
            let info;
            for (let i = 0, j = listeners.length; i < j; i++) {
                info = listeners[i];
                if (info[0] === bundle && info[1] === listener) {
                    listeners.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        add(bundle, listener, name = null, filter = '') {
            filter = prepareFilter(name, filter);
            for (let info of listeners) {
                if (info[0] === bundle && info[1] === listener) {
                    return false;
                }
            }
            listeners.push([bundle, listener, filter]);
            return true;
        },
        fire(event) {
            let cbn = callbackName;
            for (let info of listeners) {
                if (event instanceof ServiceEvent) {
                    if (info[2] === null || !info[2].match(event.reference.properties)) {
                        continue;
                    }
                }
                let listener = info[1];
                try {
                    if (typeof listener[cbn] === 'function') {
                        listener[cbn].call(listener, event);
                    }
                    else {
                        listener(event);
                    }
                }
                catch (e) {
                    console.error(`Error with listener: ${cbn}`, e);
                }
            }
        },
        clean(bundle) {
            for (let i = 0; i < listeners.length;) {
                if (listeners[i][0] === bundle) {
                    listeners.splice(i, 1);
                    continue;
                }
                i++;
            }
        }
    };
}
export default class EventDispatcher {
    constructor() {
        this.framework = createListeners('frameworkEvent');
        this.bundle = createListeners('bundleEvent');
        this.service = createListeners('serviceEvent');
        Object.freeze(this);
    }
    fireEvent(event) {
        if (event instanceof BundleEvent) {
            this.bundle.fire(event);
        }
        else if (event instanceof FrameworkEvent) {
            this.framework.fire(event);
        }
        else if (event instanceof ServiceEvent) {
            this.service.fire(event);
        }
        throw new Error('Expected one of event: ServiceEvent, BundleEvent, FrameworkEvent');
    }
    removeAll(bundle) {
        this.framework.clean(bundle);
        this.bundle.clean(bundle);
        this.service.clean(bundle);
    }
}
