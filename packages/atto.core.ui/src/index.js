import './fa4/css/font-awesome.css';
import './main.css';

import CSS from './sass/main.scss';

import {Bundles} from 'odss-common';

export class Activator{
    start(context){
        context.framework.on.bundle.add(this, this);
        context.registerService('ui.loader', this);
    }
    stop(context){
        // context.removeBundleListener(this);
        context.framework.on.bundle.remove(this, this);
    }
    bundleEvent(event){
        // console.log(event);
    }

}