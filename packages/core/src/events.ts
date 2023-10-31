import { FrameworkEvent, ServiceEvent, BundleEvent, IBundle } from '@odss/common';
import { prepareFilter } from './utils';

const BUNDLE = 0;
const LISTENER = 1;

function createListeners<T>(callbackName: string) {
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
        async fire(event: T) {
            const cbn = callbackName;
            // listeners.filter(info => {})
            const tasks = [];
            for (const info of listeners) {
                if (event instanceof ServiceEvent) {
                    if (info[2] && !info[2].match(event.reference.getProperties())) {
                        continue;
                    }
                }
                const listener = info[LISTENER];
                const task = listener[cbn] ? listener[cbn].call(listener, event) : listener(event);
                tasks.push(catchError(task, cbn));
            }
            await Promise.all(tasks);
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
        reset() {
            listeners.length = 0;
        },
    };
}
const catchError = async (task: Promise<void>, name: string) => {
    try {
        await task;
    } catch (e) {
        console.error(`Error with listener: ${name}`, e);
    }
};

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
    async fireEvent(event) {
        if (event instanceof BundleEvent) {
            await this.bundle.fire(event);
        } else if (event instanceof FrameworkEvent) {
            await this.framework.fire(event);
        } else if (event instanceof ServiceEvent) {
            await this.service.fire(event);
        }
        throw new Error('Expected one of event: ServiceEvent, BundleEvent, FrameworkEvent');
    }
    cleanBundle(bundle) {
        this.framework.clean(bundle);
        this.bundle.clean(bundle);
        this.service.clean(bundle);
    }
    reset() {
        this.framework.reset();
        this.bundle.reset();
        this.service.reset();
    }
}
