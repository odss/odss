import { IBundle, IBundleContext } from "@odss/common";

export declare class IComponent {
    readonly target: any;
    isCreated(): boolean;
    getInstance(): any;
    create(dependencies?: any[]): any;
    invoke(name: string, args: any[]): void;
    set(name: string, value: any): void;
    dispose(): void;
}
export interface IComponentContainer {
    getBundle(): IBundle;
    getBundleContext(): IBundleContext,
    getComponent(): IComponent;
    checkLifecycle(): void;
}
export interface IHandler {
    isValid(): boolean;
    setup(container: IComponentContainer): void;
    open(): void;
    close(): void;
    preValidate(): void;
    validate(): void;
    postValidate(): void;
    preInvalidate(): void;
    invalidate(): void;
    postInvalidate(): void;
}
export interface IFactoryContext {
    set<T = any>(id: string, handler: T): void;
    get<T = any>(id: string): T;
    setDefaults<T = any>(id: string, defaults: T): T;
    has(id: string): boolean;
    keys(): string[];
    values(): any[];
    entries(): [string, any][];
}
export interface IHandlerFactory {
    getHandlers(factoryContext: IFactoryContext): IHandler[];
}

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
