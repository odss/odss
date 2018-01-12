
export default {
    eq: function(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].indexOf(this.value) !== -1;
            }
            return params[this.name] === this.value;
        }
        return false;
    },
    lte: function(params) {
        return this.name in params ? params[this.name] <= this.value : false;
    },
    gte: function(params) {
        return this.name in params ? params[this.name] >= this.value : false;
    },
    approx: function(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].some(item => item.indexOf(this.value) !== -1);
            }
            return params[this.name].indexOf(this.value) !== -1;
        }
        return false;
    },
    present: function(params) {
        return this.name in params;
    },
    substring: function(params) {
        if (this.name in params) {
            if (Array.isArray(params[this.name])) {
                return params[this.name].some(item => this.value.test(item));
            }
            return this.value.test(params[this.name]);
        }
        return false;
    },
    or: function(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (this.value[i].match(params)) {
                return true;
            }
        }
        return false;
    },
    and: function(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (!this.value[i].match(params)) {
                return false;
            }
        }
        return true;
    },
    not: function(params) {
        for (let i = 0; i < this.value.length; i++) {
            if (!this.value[i].match(params)) {
                return true;
            }
        }
        return false;
    },
    all: function(/* params */) {
        return true;
    },
    none: function(/* params */){
        return false;
    }
};
