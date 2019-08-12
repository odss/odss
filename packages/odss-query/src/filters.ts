// import CRITERIAS from './criterias';

export class Filter {

    public opt: string;
    public value: any;
    public name: string;

    /**
     * @constructor
     * @param {string} opt
     * @param {mix} value
     * @param {string} name
     */
    constructor(opt: string, value: any= null, name: string= '') {
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
    public match(params: any) {
        return this[this.opt](params);
    }
    /**
     * Filter items
     *
     * @param {Array} list
     * @return {Array}
     */
    public filter(list: any[]): any[] {
        return list.filter((params) => this.match(params));
    }
    public tostring(): string {
        return '[Filter opt=' + this.opt + ' name=' + this.name + ' value=' + this.value + ']';
    }
    public eq(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].indexOf(this.value) !== -1;
            }
            return params[this.name] === this.value;
        }
        return false;
    }
    public lte(params) {
        return this.name in params ? params[this.name] <= this.value : false;
    }
    public gte(params) {
        return this.name in params ? params[this.name] >= this.value : false;
    }
    public approx(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].some((item) => item.indexOf(this.value) !== -1);
            }
            return params[this.name].indexOf(this.value) !== -1;
        }
        return false;
    }
    public present(params) {
        return this.name in params;
    }
    public substring(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].some((item) => this.value.test(item));
            }
            return this.value.test(params[this.name]);
        }
        return false;
    }
    public or(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (this.value[i].match(params)) {
                return true;
            }
        }
        return false;
    }
    public and(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (!this.value[i].match(params)) {
                return false;
            }
        }
        return true;
    }
    public not(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (!this.value[i].match(params)) {
                return true;
            }
        }
        return false;
    }
    public all(/* params */) {
        return true;
    }
    public none(/* params */) {
        return false;
    }
}
