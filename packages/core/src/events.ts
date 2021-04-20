import { FrameworkEvent, ServiceEvent, BundleEvent, IBundle } from '@odss/common';
import { prepareFilter } from './utils';

const BUNDLE = 0;
const LISTENER = 1;

function createListeners<T>(callbackName: string): any {
    const listeners: any[] = [];

    return {
        contains(bundle: IBundle, listener) {
            for (const info of listeners) {
                if (info[BUNDLE] === bundle && info[LISTENER] === listener) {
                    return true;
                }
            }
            return false;
        },
        size() {
            return listeners.length;
        },
        remove(bundle: IBundle, listener) {
            let info;
            for (let i = 0, j = listeners.length; i < j; i++) {
                info = listeners[i];
                if (info[BUNDLE] === bundle && info[LISTENER] === listener) {
                    listeners.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        add(bundle: IBundle, listener, name, filter = null) {
            for (const info of listeners) {
                if (info[BUNDLE] === bundle && info[LISTENER] === listener) {
                    return false;
                }
            }
            if (name || filter) {
                filter = prepareFilter(name, filter);
            }
            const info = [bundle, listener, filter];
            listeners.push(info);
            return true;
        },
        fire(event: T) {
            const cbn = callbackName;
            for (const info of listeners) {
                if (event instanceof ServiceEvent) {
                    if (info[2] && !info[2].match(event.reference.getProperties())) {
                        continue;
                    }
                }
                const listener = info[LISTENER];
                try {
                    if (typeof listener[cbn] === 'function') {
                        listener[cbn].call(listener, event);
                    } else {
                        listener(event);
                    }
                } catch (e) {
                    console.error(`Error with listener: ${cbn}`, e);
                }
            }
        },
        clean(bundle: IBundle) {
            for (let i = 0; i < listeners.length; ) {
                if (listeners[i][BUNDLE] === bundle) {
                    listeners.splice(i, 1);
                    continue;
                }
                i++;
            }
        },
    };
}

export default class EventDispatcher {
    public framework: any;
    public bundle: any;
    public service: any;
    constructor() {
        this.framework = createListeners<FrameworkEvent>('frameworkEvent');
        this.bundle = createListeners<BundleEvent>('bundleEvent');
        this.service = createListeners<ServiceEvent>('serviceEvent');
        Object.freeze(this);
    }
    fireEvent(event) {
        if (event instanceof BundleEvent) {
            this.bundle.fire(event);
        } else if (event instanceof FrameworkEvent) {
            this.framework.fire(event);
        } else if (event instanceof ServiceEvent) {
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
