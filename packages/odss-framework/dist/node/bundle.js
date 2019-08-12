"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@odss/common");
class Bundle {
    constructor(id, framework, meta) {
        this._state = common_1.Bundles.INSTALLED;
        this._ctx = null;
        this._id = id;
        this._framework = framework;
        this.meta = Object.assign({}, { version: '0.0.0' }, meta);
        Object.freeze(this.meta);
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
        return `odss-framework.Bundle(id=${this._id} name=${this.meta.name} namespace=${this.meta.namespace})`;
    }
}
exports.default = Bundle;
let STATES = [
    common_1.Bundles.UNINSTALLED,
    common_1.Bundles.INSTALLED,
    common_1.Bundles.RESOLVED,
    common_1.Bundles.STARTING,
    common_1.Bundles.STOPPING,
    common_1.Bundles.ACTIVE
];
function isState(state) {
    return STATES.indexOf(state) !== -1;
}
