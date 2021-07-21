import { HandlerTypes } from './consts';
import { getFactoryContext } from './cdi';
import { Metadata } from './metadata';
import { getTokenType } from './utils';
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


export type ProvideHandlerType = {
    tokens: any[];
    properties: any;
};

export type PropertyHandlerType = {
    key: string;
    name: string;
    value: any;
};

export type ConstructorInjectHandlerType = {
    index: number;
    token: string;
    filter: any;
};

export type DependencyHandlerType = PropertyHandlerType | ConstructorInjectHandlerType;

export type PropertiesInjectHandlerType = {
    key: string | symbol;
    token: any;
    filter: any;
};

export type BindHandlerType = {
    key: string | symbol;
    token: string;
    cardinality?: string;
};

export function Component(name?: string): ClassDecorator {
    return (target: any) => {
        name = name || (target as { name: string }).name;
        getFactoryContext(target).name = name;
        checkConstructorDependecy(target);
    };
}

export function Provides(tokens: any[] | any, properties: any = {}): ClassDecorator {
    return (target: any) => {
        if (!Array.isArray(tokens)) {
            tokens = [tokens];
        }
        tokens = tokens.map(getTokenType);
        getFactoryContext(target)
            .setDefaults<ProvideHandlerType[]>(HandlerTypes.PROVIDES, [])
            .push({ tokens, properties });
    };
}

export function Property(name: string, value: any): PropertyDecorator {
    return (target: any, key: string | symbol) => {
        getFactoryContext(target.constructor)
            .setDefaults<PropertyHandlerType[]>(HandlerTypes.PROPERTY, [])
            .push({ key: String(key), name, value });
    };
}

export function Inject(token?: any, filter: any = null) {
    return (target: any, key: string | symbol, index?: number): void => {
        token = token || Metadata.target(target, key).get('design:type');
        token = getTokenType(token);
        if (index === undefined) {
            // properties
            getFactoryContext(target.constructor)
                .setDefaults<PropertiesInjectHandlerType[]>(HandlerTypes.PROPERTIES_DEPENDENCY, [])
                .push({ key, token, filter });
        } else {
            getFactoryContext(target)
                .setDefaults<ConstructorInjectHandlerType[]>(
                    HandlerTypes.CONSTRUCTOR_DEPENDENCY,
                    []
                )
                .push({ index, token, filter });
        }
    };
}

export function Validate() {
    return (target: any, name: string | symbol): void => {
        getFactoryContext(target.constructor).set(HandlerTypes.VALIDATE_METHOD, {
            name,
        });
    };
}

export function Invalidate() {
    return (target: any, name: string | symbol): void => {
        getFactoryContext(target.constructor).set(HandlerTypes.INVALIDATE_METHOD, {
            name,
        });
    };
}

export function Requires(...tokens: any[]): ClassDecorator {
    return (target: any): void => checkConstructorDependecy(target, tokens);
}

export function Bind(token?: any, cardinality = '0..n'): MethodDecorator {
    return (target: any, key: string | symbol) => {
        if (!token) {
            token = (Metadata.target(target, key).get('design:paramtypes') || [])[0];
        }
        token = getTokenType(token);
        getFactoryContext(target.constructor)
            .setDefaults<BindHandlerType[]>(HandlerTypes.BIND_DEPENDENCY, [])
            .push({ key, token, cardinality });
    };
}

export function Unbind(token?: any): MethodDecorator {
    return (target: any, key: string | symbol) => {
        if (!token) {
            token = (Metadata.target(target, key).get('design:paramtypes') || [])[0];
        }
        token = getTokenType(token);
        getFactoryContext(target.constructor)
            .setDefaults<BindHandlerType[]>(HandlerTypes.UNBIND_DEPENDENCY, [])
            .push({ key, token });
    };
}
export function Modified(token?: any): MethodDecorator {
    return (target: any, key: string | symbol) => {
        if (!token) {
            token = (Metadata.target(target, key).get('design:paramtypes') || [])[0];
        }
        token = getTokenType(token);
        getFactoryContext(target.constructor)
            .setDefaults<BindHandlerType[]>(HandlerTypes.MODIFIED_DEPENDENCY, [])
            .push({ key, token });
    };
}

export function Update(): MethodDecorator {
    return (target: any, key: string | symbol) => {
        getFactoryContext(target.constructor).set(HandlerTypes.UPDATE_DEPENDENCY, {
            key,
        });
    };
}

export function checkConstructorDependecy(target: any, tokens: any[] = []): void {
    const ctx = getFactoryContext(target);
    if (!ctx.has(HandlerTypes.CONSTRUCTOR_DEPENDENCY)) {
        tokens = tokens.length ? tokens : Metadata.target(target).get('design:paramtypes') || [];
        const params = tokens.map((token, index) => ({ index, token }));
        ctx.set(HandlerTypes.CONSTRUCTOR_DEPENDENCY, params);
    }
}
