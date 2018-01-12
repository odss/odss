import CRITERIAS from './criterias';


export class Filter{
    
    public opt: string;
    public value: any;
    public name: string;
    
    /**
     * @constructor
     * @param {string} opt
     * @param {mix} value
     * @param {string} name
     */
    constructor(opt:string, value:any=null, name:string='') {
        this.opt = opt;
        this.value = value;
        this.name = name;
    }
    /**
     * Try find filter and check it
     *
     * @param {mix} param
     * @return {Boolean}
     */
    match(params: any) {
        return CRITERIAS[this.opt].call(this, params);
    }
    /**
     * Filter items
     *
     * @param {Array} list
     * @return {Array}
     */
    filter(list: Array<any>): Array<any> {
        return list.filter(params => this.match(params));
    }
    tostring(): string {
        return '[Filter opt=' + this.opt + ' name=' + this.name + ' value=' + this.value + ']';
    }
}
