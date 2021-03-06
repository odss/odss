import {Bundles, IBundle, IBundleContext, IFramework} from '@odss/common';
import { Framework } from './framework';


export default class Bundle implements IBundle {

    public meta: any;
    private _id: number;
    private _state: number = Bundles.INSTALLED;
    private _ctx: IBundleContext = null;
    private _framework: Framework;

    constructor(id: number, framework: Framework, meta: any) {
        this._id = id;
        this._framework = framework;
        this.meta = Object.assign({}, {version: '0.0.0'}, meta);
        Object.freeze(this.meta);
    }
    get id(){
        return this._id;
    }
    get state(){
        return this._state;
    }
    get context(){
        return this._ctx;
    }
    updateState(state){
        this._state = state;
    }
    setContext(ctx) {
        this._ctx = ctx;
    }
    unsetContext() {
        this._ctx = null;
    }
    async start() {
        await this._framework.startBundle(this);
    }
    async stop() {
        await this._framework.stopBundle(this);
    }
    async reload(autostart) {
        await this._framework.reloadBundle(this, autostart);
    }
    async uninstall() {
        await this._framework.uninstallBundle(this);
    }
    toString() {
        return `odss-framework.Bundle(id=${this._id} name=${this.meta.name} namespace=${this.meta.namespace})`;
    }
}

let STATES = [
    Bundles.UNINSTALLED,
    Bundles.INSTALLED,
    Bundles.RESOLVED,
    Bundles.STARTING,
    Bundles.STOPPING,
    Bundles.ACTIVE
];

function isState(state) {
    return STATES.indexOf(state) !== -1;
}
