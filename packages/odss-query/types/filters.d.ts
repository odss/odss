export declare class Filter {
    opt: string;
    value: any;
    name: string;
    /**
     * @constructor
     * @param {string} opt
     * @param {mix} value
     * @param {string} name
     */
    constructor(opt: string, value?: any, name?: string);
    /**
     * Try find filter and check it
     *
     * @param {mix} param
     * @return {Boolean}
     */
    match(params: any): any;
    /**
     * Filter items
     *
     * @param {Array} list
     * @return {Array}
     */
    filter(list: any[]): any[];
    tostring(): string;
    eq(params: any): boolean;
    lte(params: any): boolean;
    gte(params: any): boolean;
    approx(params: any): any;
    present(params: any): boolean;
    substring(params: any): any;
    or(params: any): boolean;
    and(params: any): boolean;
    not(params: any): boolean;
    all(): boolean;
    none(): boolean;
}
