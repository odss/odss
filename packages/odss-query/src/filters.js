import CRITERIAS from './criterias';
export class Filter {
    /**
     * @constructor
     * @param {string} opt
     * @param {mix} value
     * @param {string} name
     */
    constructor(opt, value = null, name = '') {
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
    match(params) {
        return CRITERIAS[this.opt].call(this, params);
    }
    /**
     * Filter items
     *
     * @param {Array} list
     * @return {Array}
     */
    filter(list) {
        return list.filter(params => this.match(params));
    }
    tostring() {
        return '[Filter opt=' + this.opt + ' name=' + this.name + ' value=' + this.value + ']';
    }
}
