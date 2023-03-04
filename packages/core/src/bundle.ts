import { Bundles, IBundle, IBundleContext, IModule, IServiceReference } from '@odss/common';
import { Framework } from './framework';

export default class Bundle implements IBundle {

    public readonly module: IModule = null;
    private _id: number = 0;
    private _state: number = Bundles.INSTALLED;
    private _ctx?: IBundleContext = null;
    private _framework?: Framework = null;

    constructor(id: number, framework: Framework, module: IModule) {
        this._id = id;
        this._framework = framework;
        this.module = module;
    }
    get id(): number {
        return this._id;
    }
    get state(): number {
        return this._state;
    }
    get context(): IBundleContext {
        return this._ctx;
    }
    get version(): string {
        return '0.0.0';
    }
    get name(): string {
        return this.module.name;
    }

    updateState(state: number): void {
        this._state = state;
    }
    setContext(ctx: IBundleContext): void {
        this._ctx = ctx;
    }
    unsetContext(): void {
        this._ctx = null;
    }
    async start(): Promise<void> {
        await this._framework.startBundle(this);
    }
    async stop(): Promise<void> {
        await this._framework.stopBundle(this);
    }
    async reload(): Promise<void> {
        await this._framework.reloadBundle(this, true);
    }
    async uninstall(): Promise<void> {
        await this._framework.uninstallBundle(this);
    }
    getRegisteredServices(): IServiceReference[] {
        return this._framework.getBundleServices(this);
    }
    getServicesInUse(): IServiceReference[] {
        return this._framework.getBundelServicesInUse(this);
    }
    toString(): string {
        return `Bundle[id=${this._id} name=${this.name} state=${STATES[this.state]}]`;
    }
}

const STATES = [...Object.entries(Bundles)].reduce((acc, [name, value]) => {
    acc[value] = name;
    return acc;
}, {});

// const STATES = [
//     Bundles.UNINSTALLED,
//     Bundles.INSTALLED,
//     Bundles.RESOLVED,
//     Bundles.STARTING,
//     Bundles.STOPPING,
//     Bundles.ACTIVE,
// ];

// function isState(state) {
//     return STATES.indexOf(state) !== -1;
// }
