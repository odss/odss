import { IBundle, IServiceReference, IServiceRegistration, Properties } from '@odss/common';
export default class Registry {
    events: any;
    private _services;
    private _registrations;
    private _specs;
    private _styles;
    private _size;
    private _sid;
    constructor(events: any);
    registerService(bundle: IBundle, clasess: any[], service: any, properties?: Properties): Promise<IServiceRegistration>;
    registerStyle(bundle: IBundle, styles: string[]): any;
    unregister(registration: ServiceRegistration): Promise<boolean>;
    unregisterAll(bundle: IBundle): Promise<void>;
    find(bundle: IBundle, reference: ServiceReference): any | null;
    unget(bundle: IBundle, reference: ServiceReference): void;
    ungetAll(bundle: any): void;
    /**
     * @param {string} name
     * @param {(object|string)} filters
     * @return {odss.core.service.Reference}
     */
    findReference(name?: any, filter?: string): IServiceReference;
    findReferences(name?: any, filter?: string): IServiceReference[];
    findBundleReferences(bundle: any): IServiceReference[];
    findBundleReferencesInUse(bundle: any): IServiceReference[];
    size(): number;
    updateProperties(registration: ServiceRegistration, oldProps: Properties): Promise<void>;
}
declare class ServiceReference implements IServiceReference {
    private _id;
    private _properties;
    private _usingBundles;
    private _sortValue;
    constructor(_id: number, _properties: any);
    getProperty<T = any>(name: string, defaultProperty?: T): T;
    getPropertyKeys(): string[];
    getProperties(): any;
    usingBundles(): IBundle[];
    usedBy(bundle: IBundle): void;
    unusedBy(bundle: IBundle): void;
    checkSortValue(): boolean;
    /**
     * Compare references
     *
     * @see SERVICE_RANKING in https://docs.osgi.org/javadoc/r4v43/core/org/osgi/framework/Constants.html
     */
    compare(ref: ServiceReference): number;
    private _computeSortValue;
    toString(): string;
}
declare class ServiceRegistration implements IServiceRegistration {
    private _registry;
    private _bundle;
    private _id;
    private _properties;
    private _reference;
    constructor(_registry: Registry, _bundle: IBundle, _id: number, _properties: Properties);
    getBundle(): IBundle;
    getReference(): ServiceReference;
    unregister(): Promise<void>;
    setProperties(properties: Properties): Promise<void>;
}
export {};
