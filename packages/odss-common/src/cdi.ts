import { HandlerTypes } from './consts';

export interface IHandler {
    [key: string]: any;
}

export class HandlersContext<T extends IHandler> {

    public static get<T extends IHandler>(obj: any): HandlersContext<T> {
        if (!Reflect.hasMetadata(HandlerTypes.FACTORY_HANDLER, obj)) {
            Reflect.defineMetadata(HandlerTypes.FACTORY_HANDLER, new HandlersContext(), obj);
        }
        return Reflect.getMetadata(HandlerTypes.FACTORY_HANDLER, obj);
    }
    public static has(obj: any): boolean {
        return Reflect.hasMetadata(HandlerTypes.FACTORY_HANDLER, obj);
    }

    public name: string = '';

    private _handlers: Map<string, T> = new Map();

    public setHandler(id: string, handler: T): void {
        this._handlers.set(id, handler);
    }
    public getHandler(id: string): T {
        return this._handlers.get(id) as T;
    }
    public getHandlers(): Array<[string, T]> {
        return Array.from(this._handlers);
    }
    public setHandlerDefaults(id: string, defaults: T): T {
        if (!this._handlers.has(id)) {
            this._handlers.set(id, defaults);
        }
        return this._handlers.get(id) as T;
    }
    public hasHandler(id: string): boolean {
        return this._handlers.has(id);
    }
}