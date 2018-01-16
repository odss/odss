import {Bundles} from 'odss-common';
import cdi from './decorators';

import ComponentsRegister from './register';
import ComponentsManager from './manager';
import metadata from './metadata';


export default cdi;

let tracker, register, manager;

export function start(ctx) {
    register = new ComponentsRegister(ctx);
    tracker = ctx.bundleTracker(Bundles.ACTIVE | Bundles.REGISTERED, {
        addingBundle: function(bundle) {
            let configs = [];
            const names = Object.keys(bundle.meta);
            for(const name of names){
                let item = bundle.meta[name];
                let isConfig = typeof item.$cdi === 'object';
                if(!isConfig){
                    continue;
                }
                if(typeof item === 'function'){
                    configs.push(item.$cdi);
                }
            }
            let manager;
            for (let i = 0; i < configs.length; i++) {
                try {
                    manager = new ComponentsManager(ctx, bundle, metadata(configs[i]));
                    register.register(manager);
                    manager.open();
                } catch (e) {
                    console.error(bundle.toString(), e);
                }
            }
        },
        removedBundle: function(bundle) {
            register.removeBundle(bundle.id);
        },
        modifiedBundle: function(bundle) {}
    }).open();
}

export function stop(ctx) {
    if (tracker) {
        tracker.close();
    }
    if (register) {
        register.close();
    }
}


