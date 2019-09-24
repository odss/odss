import { IBundle } from '@odss/common';
interface IRegistration {
    readonly id: number;
}
export default class Registry {
    events: any;
    private _services;
    private _styles;
    private _size;
    private _sid;
    constructor(events: any);
    registerService(bundle: IBundle, name: any, service: any, properties?: any): any;
    registerStyle(bundle: IBundle, styles: string[]): any;
    unregister(bundle: IBundle, registration: IRegistration): boolean;
    unregisterAll(bundle: any): void;
    find(bundle: any, reference: any): any;
    unget(bundle: any, reference: any): void;
    ungetAll(bundle: any): void;
    /**
     * @param {string} name
     * @param {(object|string)} filters
     * @return {odss.core.service.Reference}
     */
    findReference(name: any, filter?: string): any;
    /**
     * @param {string} name
     * @param {(object|string)} filters
     * @return {Array} Return list of references
     */
    findReferences(name: any, filter?: string): any[];
    /**
     * @param {odss.core.Bundle} bundle
     * @return {Array} bundle Retrun list of references
     */
    findBundleReferences(bundle: any): any[];
    findBundleReferencesInUse(bundle: any): any[];
    size(): number;
    updateProperties(registration: any, oldProps: any): void;
}
export {};
