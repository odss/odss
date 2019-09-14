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

export function Inject<T = any>(token?: T) {
    return (target: Object, key: string | symbol, index?: number) => {
        token = token || Reflect.getMetadata('design:type', target, key);
        const type = token && isFunction(token) ? ((token as any) as Function).name : token;
        // console.log({target, key, index, type})
        if (isUndefined(index)) {
            let properties = Reflect.getMetadata(
                MetadataKeys.PROPERTIES_DEPENDENCY,
                target.constructor,
            ) || [];
            Reflect.defineMetadata(
                MetadataKeys.PROPERTIES_DEPENDENCY,
                properties.concat([{ key, type }]),
                target.constructor,
            );
        } else {
            let params = Reflect.getMetadata(
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

export function Validate(target: object, name: string | symbol) {
    Reflect.defineMetadata(MetadataKeys.VALIDATE_METHOD, { name }, target.constructor);
}

export function Invalidate(target: object, name: string | symbol) {
    Reflect.defineMetadata(MetadataKeys.INVALIDATE_METHOD, { name }, target.constructor);
}
