import { IBundle } from 'odss-common';
import { Framework } from './framework';
export default class Bundle implements IBundle {
    meta: any;
    private _id;
    private _state;
    private _ctx;
    private _framework;
    constructor(id: number, framework: Framework, meta: any);
    readonly id: number;
    readonly state: number;
    readonly context: any;
    updateState(state: any): void;
    setContext(ctx: any): void;
    unsetContext(): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    reload(autostart: any): Promise<void>;
    uninstall(): Promise<void>;
    toString(): string;
}
