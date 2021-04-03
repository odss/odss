import { getTokenType, HandlerTypes, HandlersContext } from '@odss/common';

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
        const context = HandlersContext.get(target);
        context.name = name;
        checkConstructorDependecy(target);
    };
}
type ProvideHandler = {
    types: string[];
    properties: any;
};

export function Provides(tokens: any[] | any, properties: any = {}): ClassDecorator {
    return (target: object) => {
        if (!Array.isArray(tokens)) {
            tokens = [tokens];
        }
        const types = tokens.map(getTokenType);
        HandlersContext.get<ProvideHandler[]>(target)
            .setHandlerDefaults(HandlerTypes.PROVIDES, [])
            .push({ types, properties });
    };
}
type PropertyHandler = {
    name: string;
    value: any;
    key: string | symbol;
};

export function Property(name: string, value: any): PropertyDecorator {
    return (target: object, key: string | symbol) => {
        // Reflect.defineMetadata(HandlerTypes.PROPERTY, { name, value, key }, target);
        HandlersContext.get<PropertyHandler[]>(target)
            .setHandlerDefaults(HandlerTypes.PROPERTY, [])
            .push({ name, value, key });
    };
}
type ConstructorInjectHandler = {
    index: number;
    type: string;
    filter: any;
};

type PropertiesInjectHandler = {
    key: string | symbol;
    type: string;
    filter: any;
};

export function Inject(token?: any, filter: any = null) {
    return (target: object, key: string | symbol, index?: number) => {
        token = token || Reflect.getMetadata('design:type', target, key);
        const type = getTokenType(token);
        if (index === undefined) {
            // properties
            HandlersContext.get<PropertiesInjectHandler[]>(target.constructor)
                .setHandlerDefaults(
                    HandlerTypes.PROPERTIES_DEPENDENCY,
                    []
                )
                .push({ key, type, filter });
        } else {
            const params =
                Reflect.getMetadata(HandlerTypes.CONSTRUCTOR_DEPENDENCY, target) || [];
            Reflect.defineMetadata(
                HandlerTypes.CONSTRUCTOR_DEPENDENCY,
                params.concat([{ index, type, filter }]),
                target
            );
            HandlersContext.get<ConstructorInjectHandler[]>(target)
                .setHandlerDefaults(
                    HandlerTypes.CONSTRUCTOR_DEPENDENCY,
                    []
                )
                .push({ index, type, filter });
        }
    };
}

export function Validate() {
    return (target: any, name: string | symbol) => {
        HandlersContext.get(target.constructor).setHandler(HandlerTypes.VALIDATE_METHOD, {
            name,
        });
    };
}

export function Invalidate() {
    return (target: any, name: string | symbol) => {
        HandlersContext.get(target.constructor).setHandler(HandlerTypes.INVALIDATE_METHOD, {
            name,
        });
    };
}

export function Requires(...tokens: any[]): ClassDecorator {
    return (target: object) => checkConstructorDependecy(target, tokens);
}

type BindHandler = {
    key: string | symbol;
    type: string;
    cardinality?: string;
};

export function Bind(token?: any, cardinality: string = '0..n') {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        HandlersContext.get<BindHandler[]>(target.constructor)
            .setHandlerDefaults(HandlerTypes.BIND_DEPENDENCY, [])
            .push({ key, type, cardinality });
    };
}

export function Unbind(token?: any) {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        HandlersContext.get<BindHandler[]>(target.constructor)
            .setHandlerDefaults(HandlerTypes.UNBIND_DEPENDENCY, [])
            .push({ key, type });
    };
}
export function Modified(token?: any): MethodDecorator {
    return (target: object, key: string | symbol, descriptor) => {
        if (!token) {
            token = (Reflect.getMetadata('design:paramtypes', target, key) || [])[0];
        }
        const type = getTokenType(token);
        HandlersContext.get<BindHandler[]>(target.constructor)
            .setHandlerDefaults(HandlerTypes.MODIFIED_DEPENDENCY, [])
            .push({ key, type });
    };
}

export function Update(): MethodDecorator {
    return (target: object, key: string | symbol, descriptor) => {
        HandlersContext.get(target.constructor).setHandler(HandlerTypes.UPDATE_DEPENDENCY, {
            key,
        });
    };
}

export function checkConstructorDependecy(target, tokens: any[] = []) {
    const context = HandlersContext.get(target);
    if (!context.hasHandler(HandlerTypes.CONSTRUCTOR_DEPENDENCY)) {
        tokens = tokens.length ? tokens : Reflect.getMetadata('design:paramtypes', target) || [];
        const params = tokens.map(getTokenType).map((type, index) => ({ index, type }));
        context.setHandler(HandlerTypes.CONSTRUCTOR_DEPENDENCY, params);
    }
}
