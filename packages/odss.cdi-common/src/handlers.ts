import { Metadata } from '@odss/common';

import { IFactoryContext } from './interfaces';
import { FACTORY_CONTEXT } from './consts';

export function getFactoryContext(target: any): FactoryContext {
    const metadata = Metadata.target(target);
    if (!metadata.has(FACTORY_CONTEXT)) {
        metadata.set(FACTORY_CONTEXT, new FactoryContext());
    }
    return metadata.get(FACTORY_CONTEXT);
}
export function hasFactoryContext(target: any): boolean {
    return Metadata.target(target).has(FACTORY_CONTEXT);
}

export class FactoryContext implements IFactoryContext {
    public name: string = '';
    private _handlers: Map<string, any> = new Map();

    public set<T = any>(id: string, handler: T): void {
        this._handlers.set(id, handler);
    }
    public get<T = any>(id: string): T {
        return this._handlers.get(id) as T;
    }
    public keys(): string[] {
        return [...this._handlers.keys()];
    }
    public values(): any[] {
        return [...this._handlers.values()];
    }
    public entries(): [string, any][] {
        return [...this._handlers.entries()];
    }
    public setDefaults<T = any>(id: string, defaults: T): T {
        if (!this._handlers.has(id)) {
            this._handlers.set(id, defaults);
        }
        return this._handlers.get(id) as T;
    }
    public has(id: string): boolean {
        return this._handlers.has(id);
    }
}
