import {Bundles} from 'odss-common';

import ComponentsRegister from './register';
import ComponentsManager from './manager';
import metadata from './metadata';


export class Activator{
    start(ctx) {
        this.register = new ComponentsRegister(ctx);
        this.tracker = ctx.bundleTracker(Bundles.ACTIVE | Bundles.REGISTERED, {
            addingBundle: bundle => {
                const configs = findComponents(bundle.meta);
                const components = createComponentsManager(ctx, bundle, configs);
                for (let component of components) {
                    this.register.register(component);
                    component.open();
                }
            },
            removedBundle: bundle => {
                this.register.removeBundle(bundle.id);
            },
            modifiedBundle: bundle => {

            }
        }).open();
    }

    stop(ctx) {
        if (this.tracker) {
            this.tracker.close();
        }
        if (this.register) {
            this.register.close();
        }
    }
}

function* findComponents(meta) {
    for(let item of Object.values(meta)){
        if(item.__ODSS_CDI__){
            yield item.__ODSS_CDI__;
        }
    }
}

function* createComponentsManager(ctx, bundle, configs){
    for(let config of configs) {
        try {
            yield new ComponentsManager(ctx, bundle, metadata(config));
        } catch (e) {
            console.error(bundle.toString(), e);
        }
    }
}