import 'reflect-metadata';

import { isFunction, isUndefined } from '@stool/core';
import { MetadataKeys } from './consts';

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

export function Inject(token?: any) {
    return (target: object, key: string | symbol, index?: number) => {
        token = token || Reflect.getMetadata('design:type', target, key);
        const type = getTokenType(token);
        // console.log({target, key, index, type})
        if (isUndefined(index)) {
            const properties = Reflect.getMetadata(
                MetadataKeys.PROPERTIES_DEPENDENCY,
                target.constructor,
            ) || [];
            Reflect.defineMetadata(
                MetadataKeys.PROPERTIES_DEPENDENCY,
                properties.concat([{ key, type }]),
                target.constructor,
            );
        } else {
            const params = Reflect.getMetadata(
                MetadataKeys.CONSTRUCTOR_DEPENDENCY,
                target,
            ) || [];
            Reflect.defineMetadata(
                MetadataKeys.CONSTRUCTOR_DEPENDENCY,
                params.concat([{ index, type }]),
                target,
            );
        }
    };
}

export function Validate() {
    return (target: any, name: string | symbol) => {
        Reflect.defineMetadata(
            MetadataKeys.VALIDATE_METHOD,
            { name },
            target.constructor,
        );
    };
}

export function Invalidate() {
    return (target: any, name: string | symbol) => {
        Reflect.defineMetadata(MetadataKeys.INVALIDATE_METHOD, { name }, target.constructor);
    };
}

export function Component(name?: string): ClassDecorator {
    return (target: object) => {
        name = name || (target as Function).name;
        Reflect.defineMetadata(MetadataKeys.COMPONENT, { name }, target);
        if (!Reflect.hasMetadata(MetadataKeys.CONSTRUCTOR_DEPENDENCY, target)) {
            checkConstructorDependecy(target);
        }
    };
}

export function Requires(...tokens: any[]): ClassDecorator {
    return (target: object) => {
        checkConstructorDependecy(target, tokens);
    };
}

export function Bind(token?: any, cardinality: string = '0..n') {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        const params = Reflect.getMetadata(
            MetadataKeys.BIND_DEPENDENCY,
            target.constructor,
        ) || [];

        Reflect.defineMetadata(
            MetadataKeys.BIND_DEPENDENCY,
            params.concat([{ key, type, cardinality }]),
            target.constructor,
        );
    };
}

export function Unbind(token?: any) {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        const params = Reflect.getMetadata(
            MetadataKeys.UNBIND_DEPENDENCY,
            target.constructor,
        ) || [];
        Reflect.defineMetadata(
            MetadataKeys.UNBIND_DEPENDENCY,
            params.concat([{ key, type }]),
            target.constructor,
        );
    };
}
export function Modified(token?: any) {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        const params = Reflect.getMetadata(
            MetadataKeys.MODIFIED_DEPENDENCY,
            target.constructor,
        ) || [];
        Reflect.defineMetadata(
            MetadataKeys.MODIFIED_DEPENDENCY,
            params.concat([{ key, type }]),
            target.constructor,
        );
    };
}

export function Update() {
    return (target: object, key: string | symbol, descriptor) => {
        Reflect.defineMetadata(
            MetadataKeys.UPDATE_DEPENDENCY,
            [{ key }],
            target.constructor,
        );
    };
}

function checkConstructorDependecy(target, tokens = []) {
    tokens = tokens.length ? tokens : Reflect.getMetadata('design:paramtypes', target) || [];
    const params = tokens
        .map(getTokenType)
        .map((type, index) => ({ index, type }));
    Reflect.defineMetadata(
        MetadataKeys.CONSTRUCTOR_DEPENDENCY,
        params,
        target,
    );
}

function getTokenType(token: any) {
    return token && isFunction(token) ? (token as Function).name : token;
}
