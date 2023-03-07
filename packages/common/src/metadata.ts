import 'reflect-metadata';

export interface MetadataScanCallback<R> {
    (name: string, prototype: any): R;
}

export interface IMetadata {
    [key: string]: any;
}

export interface MetadataScanKeys<M> {
    name: string;
    metadata: M;
    handler: (...args: any[]) => any;
}

function scanMetadata<R>(prototype: any, callback: MetadataScanCallback<R>): R[] {
    const isHandler = name => typeof prototype[name] === 'function' && name !== 'constructor';
    let result: R[] = [];
    while (prototype && prototype !== Object.prototype) {
        const r = Object.getOwnPropertyNames(prototype)
            .filter(isHandler)
            .map(name => callback(name, prototype))
            .filter((item: R): R => item);
        result = result.concat(r);
        prototype = Object.getPrototypeOf(prototype);
    }
    return result;
}
export class Metadata {
    static scan<I, R = any>(instance: I, prototype: any, callback: MetadataScanCallback<R>): R[] {
        const proto =
            typeof prototype === 'undefined' || prototype === null
                ? Object.getPrototypeOf(instance)
                : prototype;
        return scanMetadata<R>(proto, callback);
    }
    static scanByKey<I, M = any>(instance: I, prototype: any, key: string): MetadataScanKeys<M>[] {
        return Metadata.scan<I, MetadataScanKeys<M>>(instance, prototype, (name, p) => {
            const metadata = Reflect.getMetadata(key, p, name);
            if (metadata) {
                return {
                    name,
                    metadata,
                    handler: instance[name],
                };
            }
        });
    }
    static target(obj: any, name: string | symbol = undefined): MetadataTarget {
        return new MetadataTarget(obj, name);
    }
}
class MetadataTarget {
    constructor(private obj: any, private name: string | symbol = undefined) {}

    set<T = any>(key: string, value: T): void {
        Reflect.defineMetadata(key, value, this.obj, this.name);
    }
    setDefaults<T = any>(key: string, value: T): T {
        if (!Reflect.hasMetadata(key, this.obj, this.name)) {
            Reflect.defineMetadata(key, value, this.obj, this.name);
        }
        return Reflect.getMetadata(key, this.obj, this.name);
    }
    has(key: string): boolean {
        return Reflect.hasMetadata(key, this.obj, this.name);
    }
    get<R = any>(key: string): R {
        return Reflect.getMetadata(key, this.obj, this.name);
    }
}
