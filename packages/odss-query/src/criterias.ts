
export default {
    eq(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].indexOf(this.value) !== -1;
            }
            return params[this.name] === this.value;
        }
        return false;
    },
    lte(params) {
        return this.name in params ? params[this.name] <= this.value : false;
    },
    gte(params) {
        return this.name in params ? params[this.name] >= this.value : false;
    },
    approx(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].some((item) => item.indexOf(this.value) !== -1);
            }
            return params[this.name].indexOf(this.value) !== -1;
        }
        return false;
    },
    present(params) {
        return this.name in params;
    },
    substring(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].some((item) => this.value.test(item));
            }
            return this.value.test(params[this.name]);
        }
        return false;
    },
    or(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (this.value[i].match(params)) {
                return true;
            }
        }
        return false;
    },
    and(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (!this.value[i].match(params)) {
                return false;
            }
        }
        return true;
    },
    not(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (!this.value[i].match(params)) {
                return true;
            }
        }
        return false;
    },
    all(/* params */) {
        return true;
    },
    none(/* params */) {
        return false;
    },
};
