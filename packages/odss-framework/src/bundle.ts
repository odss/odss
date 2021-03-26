import {Bundles, IBundle, IBundleContext, IFramework, IServiceReference} from '@odss/common';
import { Framework } from './framework';

type TMeta = any;

export default class Bundle implements IBundle {

    public readonly meta: TMeta;

    private _id: number;
    private _state: number = Bundles.INSTALLED;
    private _ctx?: IBundleContext = null;
    private _framework: Framework;

    constructor(id: number, framework: Framework, meta: TMeta) {
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
    get context() {
        return this._ctx;
    }
    get version(): string {
        return '0.0.0';
    }
    get location(): string {
        return this.meta.location;
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
    async reload(): Promise<void> {
        await this._framework.reloadBundle(this, true);
    }
    async uninstall() {
        await this._framework.uninstallBundle(this);
    }
    getRegisteredServices(): IServiceReference[] {
        return [];
    }
    getServicesInUse(): IServiceReference[] {
        return [];
    }
    toString() {
        return `odss-framework.Bundle(id=${this._id} name=${this.meta.name} namespace=${this.meta.namespace})`;
    }
}

const STATES = [
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
