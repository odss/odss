import { IBundle, IBundleContext, IModule, IServiceReference } from '@odss/common';
import { Framework } from './framework';
export default class Bundle implements IBundle {
    readonly module: IModule;
    private _id;
    private _state;
    private _ctx?;
    private _framework?;
    constructor(id: number, framework: Framework, module: IModule);
    get id(): number;
    get state(): number;
    get context(): IBundleContext;
    get version(): string;
    get name(): string;
    updateState(state: number): void;
    setContext(ctx: IBundleContext): void;
    unsetContext(): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    reload(): Promise<void>;
    uninstall(): Promise<void>;
    getRegisteredServices(): IServiceReference[];
    getServicesInUse(): IServiceReference[];
    toString(): string;
}
