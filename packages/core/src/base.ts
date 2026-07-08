import { IBundle, IServiceReference, SERVICE_RANKING, OBJECTCLASS } from '@odss/common';

interface TProperties {
    [key: string]: any;
}
export class ServiceReference implements IServiceReference {
    private _usingBundles: Set<IBundle> = new Set();
    private _sortValue: [number, number] = [0, 0];

    constructor(
        private _id: number,
        private _properties: any,
    ) {
        this.checkSortValue();
    }
    getProperty<T = any>(name: string, defaultProperty: T = null): T {
        if (typeof this._properties[name] !== 'undefined') {
            return this._properties[name];
        }
        if (defaultProperty !== null) {
            return defaultProperty;
        }
        return null;
    }
    getPropertyKeys(): string[] {
        return Object.keys(this._properties);
    }
    getProperties(): TProperties {
        return { ...this._properties };
    }
    usingBundles(): IBundle[] {
        return [...this._usingBundles];
    }

    usedBy(bundle: IBundle): void {
        this._usingBundles.add(bundle);
    }
    unusedBy(bundle: IBundle): void {
        this._usingBundles.delete(bundle);
    }
    checkSortValue(): boolean {
        const sortValue = this._computeSortValue();
        if (this._sortValue !== sortValue) {
            this._sortValue = sortValue;
            return true;
        }
        return false;
    }
    /**
     * Compare references
     *
     * @see SERVICE_RANKING in https://docs.osgi.org/javadoc/r4v43/core/org/osgi/framework/Constants.html
     */
    compare(ref: ServiceReference): number {
        const [rank1, id1] = this._sortValue;
        const [rank2, id2] = ref._sortValue;
        return rank1 === rank2 ? id1 - id2 : rank2 - rank1;
    }
    private _computeSortValue(): [number, number] {
        return [this._properties[SERVICE_RANKING], this._id];
    }
    toString() {
        const classes = this.getProperty(OBJECTCLASS).map((item) => (item.name ? item.name : item));
        return `[Reference id=${this._id} classes=(${classes.join(',')})]`;
    }
}
