import {
    IComponent,
    IServiceReference,
    IServiceTrackerListener,
    ServiceTracker,
    IBundleContext,
} from '@odss/common';
// import { InstanceWrapper } from "./instance-wrapper";

interface ICardinality extends IServiceTrackerListener<any> {
    isSatisfied(): boolean;
}

interface IDependency extends IServiceTrackerListener<any> {
    open(): void;
    close(): void;
    isSatisfied(): boolean;
}

/**
 * Candinality: 0..1
 */
export class OptionalCardinality implements ICardinality {
    protected ref: IServiceReference = null;

    constructor(private dependency: IDependency) {}

    async addingService(service: any, reference: IServiceReference) {
        if (this.ref === null) {
            this.ref = reference;
            this.dependency.addingService(service, reference);
        }
    }
    async modifiedService(service: any, reference: IServiceReference) {
        if (this.ref === reference) {
            this.dependency.modifiedService(service, reference);
        }
    }
    async removedService(service: any, reference: IServiceReference) {
        if (this.ref === reference) {
            this.dependency.removedService(service, reference);
            this.ref = null;
        }
    }

    isSatisfied() {
        return true;
    }
}

/**
 * Candinality: 1..1
 */
class MandatoryCardinality extends OptionalCardinality {
    isSatisfied() {
        return this.ref !== null;
    }
}

/**
 * Candinality: 0..n
 */
class MultipleCardinality implements ICardinality {
    protected counter: number = 0;

    constructor(private dependency: IDependency) {}

    async addingService(service: any, reference: IServiceReference) {
        this.counter += 1;
        this.dependency.addingService(service, reference);
    }

    async modifiedService(service: any, reference: IServiceReference) {
        this.dependency.modifiedService(service, reference);
    }

    async removedService(service: any, reference: IServiceReference) {
        this.dependency.removedService(service, reference);
        this.counter -= 1;
    }

    isSatisfied() {
        return true;
    }
}
/**
 * Candinality: 1..n
 */
class MandatoryMultipleCardinality extends MultipleCardinality {
    isSatisfied() {
        return this.counter > 0;
    }
}

export function getCardinality(dependency: IDependency, cardinality: string): ICardinality {
    switch (cardinality) {
        case '0..1':
            return new OptionalCardinality(dependency);
        case '1..1':
            return new MandatoryCardinality(dependency);
        case '0..n':
            return new MultipleCardinality(dependency);
        case '1..n':
            return new MandatoryMultipleCardinality(dependency);
    }
    throw new Error(`Unknown candinality: ${cardinality}`);
}

export class ConstructorDependency implements IDependency {
    private tracker: ServiceTracker;
    private cardinality: ICardinality;
    private _service: any = null;

    constructor(private ctx: IBundleContext, config: any, private notifier: () => void) {
        const { token } = config;
        this.cardinality = getCardinality(this, '1..1');
        this.tracker = new ServiceTracker(ctx, token, this.cardinality);
    }
    open() {
        this.tracker.open();
    }
    close() {
        this.tracker.close();
    }
    async addingService(service: any) {
        this._service = service;
    }

    async modifiedService(service: any) {}

    async removedService(service: any) {
        this._service = null;
    }
    get service() {
        return this._service;
    }
    isSatisfied() {
        return this.cardinality.isSatisfied();
    }
}

export class ParamDependency implements IDependency {
    private tracker: ServiceTracker;
    private cardinality: ICardinality;
    private _service: any = null;

    constructor(ctx: IBundleContext, private config: any, private notifier: () => void) {
        const { token } = config;
        this.cardinality = getCardinality(this, '1..1');
        this.tracker = new ServiceTracker(ctx, token, this.cardinality);
    }
    get service() {
        return this._service;
    }
    get key() {
        return this.config.key;
    }
    open() {
        this.tracker.open();
    }
    close() {
        this.tracker.close();
    }
    async addingService(service: any) {
        this._service = service;
        this.notifier();
    }

    async modifiedService(service: any) {}

    async removedService(service: any) {
        this._service = null;
        this.notifier();
    }
    isSatisfied() {
        return this.cardinality.isSatisfied();
    }
}

export class ReferenceDependency implements IDependency {
    private tracker: ServiceTracker;
    private cardinality: ICardinality;

    constructor(private ctx: IBundleContext, private component: IComponent, private config: any) {
        const { token } = config;
        this.cardinality = getCardinality(this, '0..n');
        this.tracker = new ServiceTracker(ctx, token, this.cardinality);
    }
    public async open() {
        await this.tracker.open();
    }
    public async close() {
        await this.tracker.close();
    }
    async addingService(service: any, reference: IServiceReference) {
        const { bind } = this.config;
        if (bind) {
            await this.component.invoke(bind, [service, reference]);
        }
    }
    async modifiedService(service: any) {}
    async removedService(service: any, reference: IServiceReference) {
        const { unbind } = this.config;
        if (unbind) {
            await this.component.invoke(unbind, [service, reference]);
        }
    }
    public isSatisfied() {
        return this.cardinality.isSatisfied();
    }
}
