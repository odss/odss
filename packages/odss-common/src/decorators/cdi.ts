import { getTokenType } from '../utils';
import { MetadataHandlers } from '../consts';

/*
interface TypedPropertyDescriptor<T> {
    enumerable?: boolean;
    configurable?: boolean;
    writable?: boolean;
    value?: T;
    get?: () => T;
    set?: (value: T) => void;
}
declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
*/

export function Component(name?: string): ClassDecorator {
    return (target: object) => {
        name = name || (target as Function).name;
        Reflect.defineMetadata(MetadataHandlers.COMPONENT, { name }, target);
        if (!Reflect.hasMetadata(MetadataHandlers.CONSTRUCTOR_DEPENDENCY, target)) {
            checkConstructorDependecy(target);
        }
    };
}

export function Provides(tokens: any[] | any): ClassDecorator {
    return (target: object) => {
        if (!Array.isArray(tokens)) {
            tokens = [tokens];
        }
        const names = tokens.map(getTokenType);
        Reflect.defineMetadata(MetadataHandlers.PROVIDES, names, target);
    };
}

export function Property(name, value): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(MetadataHandlers.PROPERTY, [name, value], target);
    };
}

export function Inject(token?: any) {
    return (target: object, key: string | symbol, index?: number) => {
        token = token || Reflect.getMetadata('design:type', target, key);
        const type = getTokenType(token);
        if (index === undefined) {
            // properties
            const properties =
                Reflect.getMetadata(MetadataHandlers.PROPERTIES_DEPENDENCY, target.constructor) ||
                [];
            Reflect.defineMetadata(
                MetadataHandlers.PROPERTIES_DEPENDENCY,
                properties.concat([{ key, type }]),
                target.constructor
            );
        } else {
            const params =
                Reflect.getMetadata(MetadataHandlers.CONSTRUCTOR_DEPENDENCY, target) || [];
            Reflect.defineMetadata(
                MetadataHandlers.CONSTRUCTOR_DEPENDENCY,
                params.concat([{ index, type }]),
                target
            );
        }
    };
}

export function Validate() {
    return (target: any, name: string | symbol) =>
        Reflect.defineMetadata(MetadataHandlers.VALIDATE_METHOD, name, target.constructor);
}

export function Invalidate() {
    return (target: any, name: string | symbol) =>
        Reflect.defineMetadata(MetadataHandlers.INVALIDATE_METHOD, name, target.constructor);
}

export function Requires(...tokens: any[]): ClassDecorator {
    return (target: object) => checkConstructorDependecy(target, tokens);
}

export function Bind(token?: any, cardinality: string = '0..n') {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        const params =
            Reflect.getMetadata(MetadataHandlers.BIND_DEPENDENCY, target.constructor) || [];

        Reflect.defineMetadata(
            MetadataHandlers.BIND_DEPENDENCY,
            params.concat([{ key, type, cardinality }]),
            target.constructor
        );
    };
}

export function Unbind(token?: any) {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        const params =
            Reflect.getMetadata(MetadataHandlers.UNBIND_DEPENDENCY, target.constructor) || [];
        Reflect.defineMetadata(
            MetadataHandlers.UNBIND_DEPENDENCY,
            params.concat([{ key, type }]),
            target.constructor
        );
    };
}
export function Modified(token?: any) {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        const params =
            Reflect.getMetadata(MetadataHandlers.MODIFIED_DEPENDENCY, target.constructor) || [];
        Reflect.defineMetadata(
            MetadataHandlers.MODIFIED_DEPENDENCY,
            params.concat([{ key, type }]),
            target.constructor
        );
    };
}

export function Update() {
    return (target: object, key: string | symbol, descriptor) => {
        Reflect.defineMetadata(MetadataHandlers.UPDATE_DEPENDENCY, [{ key }], target.constructor);
    };
}

function checkConstructorDependecy(target, tokens: any[] = []) {
    tokens = tokens.length ? tokens : Reflect.getMetadata('design:paramtypes', target) || [];
    const params = tokens.map(getTokenType).map((type, index) => ({ index, type }));
    Reflect.defineMetadata(MetadataHandlers.CONSTRUCTOR_DEPENDENCY, params, target);
}
