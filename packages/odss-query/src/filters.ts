import * as consts from './consts';

export type PValue = string | string[] | number | number[];
export type Params = {
    [key: string]: PValue;
};

export interface IFilter {
    readonly opt: string;
    match(params: Params): boolean;
}
export interface INamedsFilter extends IFilter {
    readonly name: string;
    readonly value: string;
}
export interface ICompositeFilter extends IFilter {
    filters: IFilter[];
}

export abstract class Filter implements IFilter {
    constructor(public readonly opt: string) {}


    abstract match(params: Params): boolean;

    public toString(): string {
        return '[Filter opt=' + this.opt + ']';
    }

    static isFilter(obj: any ): boolean {
        return obj && obj.opt && typeof obj.match === 'function';
    }
    static create(opt: string, name: string, value = ''): IFilter {
        switch (opt) {
            case consts.EQ:
                return new EqFilter(name, value);
            case consts.LTE:
                return new LteFilter(name, value);
            case consts.GTE:
                return new GteFilter(name, value);
            case consts.APPROX:
                return new ApproxFilter(name, value);
            case consts.PRESENT:
                return new PresentFilter(name);
        }
        throw Error(`Not found type: ${opt}`);
    }
}

export class AllFilter extends Filter {
    constructor() {
        super(consts.MATCH_ALL);
    }
    match(): boolean {
        return true;
    }
}
export class NoneFilter extends Filter {
    constructor() {
        super(consts.MATCH_NONE);
    }
    match(): boolean {
        return false;
    }
}

export class ApproxFilter extends Filter {
    constructor(public readonly name: string, public readonly value: string) {
        super(consts.APPROX);
    }
    match(params: Params): boolean {
        const value = params[this.name];
        if (value) {
            if (Array.isArray(value)) {
                return value.some(item => item.includes(this.value));
            }
            if (typeof value === 'string') {
                return value.indexOf(this.value) !== -1;
            }
        }
        return false;
    }
}
export class PresentFilter extends Filter {
    constructor(public readonly name: string) {
        super(consts.PRESENT);
    }
    match(params: Params): boolean {
        return this.name in params;
    }
}

export class SubstringFilter extends Filter {
    constructor(public readonly name: string, public readonly regexp: RegExp) {
        super(consts.SUBSTRING);
    }
    match(params: Params): boolean {
        if (this.name in params) {
            const value = params[this.name];
            if (Array.isArray(value)) {
                return value.some(item => this.regexp.test(item));
            }
            return this.regexp.test('' + value);
        }
        return false;
    }
}
export class EqFilter extends Filter implements INamedsFilter {
    constructor(public readonly name: string, public readonly value: string) {
        super(consts.EQ);
    }
    match(params: Params): boolean {
        const value = params[this.name] as [string];
        if (value) {
            if (Array.isArray(value)) {
                return value.includes(this.value);
            }
            return value === this.value;
        }
        return false;
    }
}
export class GteFilter extends Filter implements INamedsFilter {
    constructor(public readonly name: string, public readonly value: string) {
        super(consts.GTE);
    }
    match(params: Params): boolean {
        return this.name in params ? params[this.name] >= this.value : false;
    }
}

export class LteFilter extends Filter implements INamedsFilter {
    constructor(public readonly name: string, public readonly value: string) {
        super(consts.LTE);
    }
    match(params: Params): boolean {
        return this.name in params ? params[this.name] <= this.value : false;
    }
}

export class NotFilter extends Filter implements ICompositeFilter {
    constructor(public readonly filters: IFilter[] = []) {
        super(consts.NOT);
    }
    match(params: Params): boolean {
        for (let i = 0; i < this.filters.length; i++) {
            if (!this.filters[i].match(params)) {
                return true;
            }
        }
        return false;
    }
}
export class AndFilter extends Filter implements ICompositeFilter {
    constructor(public readonly filters: IFilter[] = []) {
        super(consts.AND);
    }
    match(params: Params): boolean {
        for (let i = 0; i < this.filters.length; i++) {
            if (!this.filters[i].match(params)) {
                return false;
            }
        }
        return true;
    }
}

export class OrFilter extends Filter implements ICompositeFilter {
    constructor(public readonly filters: IFilter[] = []) {
        super(consts.OR);
    }
    match(params: Params): boolean {
        for (let i = 0; i < this.filters.length; i++) {
            if (this.filters[i].match(params)) {
                return true;
            }
        }
        return false;
    }
}
