import { Bundles } from 'odss-common';
export default class Bundle {
    constructor(id, framework, meta) {
        this._state = Bundles.INSTALLED;
        this._ctx = null;
        meta.version = meta.version || '0.0.0';
        this.meta = meta;
        Object.freeze(this.meta);
        this._id = id;
        this._framework = framework;
    }
    get id() {
        return this._id;
    }
    get state() {
        return this._state;
    }
    get context() {
        return this._ctx;
    }
    updateState(state) {
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
        return 'odss.core.Bundle(id=' + this._id + ' name="' + this.meta.name + '" namespace=' + this.meta.namespace + ')';
    }
}
let states = [
    Bundles.UNINSTALLED,
    Bundles.INSTALLED,
    Bundles.RESOLVED,
    Bundles.STARTING,
    Bundles.STOPPING,
    Bundles.ACTIVE
];
function isState(state) {
    return states.indexOf(state) !== -1;
}
