import {
    IServiceReference,
    IServiceTrackerListener,
    ServiceTracker,
    IBundleContext
} from "@odss/common";
import { InstanceWrapper } from "./instance-wrapper";

interface ICardinality extends IServiceTrackerListener {
    isSatisfied(): boolean;
}

interface IDependency extends IServiceTrackerListener{
    open(): void
    close(): void;
    isSatisfied(): boolean;
}

/**
 * Candinality: 0..1
 */
export class OptionalCardinality implements ICardinality {

    protected serviceId: number = 0;

    constructor(private dependency: IDependency) {}

    addingService(reference: IServiceReference, service: any) {
        if (this.serviceId === null) {
            this.serviceId = reference.id;
            this.dependency.addingService(reference, service);
        }
    }
    modifiedService(reference: IServiceReference, service: any) {
        if (this.serviceId === reference.id) {
            this.dependency.modifiedService(reference, service);
        }
    }
    removedService(reference: IServiceReference, service: any) {
        if (this.serviceId === reference.id) {
            this.serviceId = 0;
            this.dependency.removedService(reference, service);
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
        return this.serviceId !== null;
    }
}

/**
 * Candinality: 0..n
 */
class MultipleCardinality implements ICardinality {

    protected counter: number = 0;

    constructor(private dependency: IDependency) {}

    addingService(reference: IServiceReference, service: any) {
        this.counter += 1;
        this.dependency.addingService(reference, service);
    }

    modifiedService(reference: IServiceReference, service: any) {
        this.dependency.modifiedService(reference, service);
    }

    removedService(reference: IServiceReference, service: any) {
        this.dependency.removedService(reference, service);
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

    private tracker: ServiceTracker
    private cardinality: ICardinality;
    private _service: any = null;

    constructor(
        private ctx: IBundleContext,
        private config: any,
    ) {
        const { type } = config;
        this.cardinality = getCardinality(this, '1..1');
        this.tracker = ctx.serviceTracker(type, this.cardinality);
    }
    open() {
        this.tracker.open();
    }
    close() {
        this.tracker.close();
    }
    addingService(reference: IServiceReference, service: any) {
        this._service = service;
    }

    modifiedService(reference: IServiceReference, service: any) {
    }

    removedService(reference: IServiceReference, service: any) {
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

    private tracker: ServiceTracker
    private cardinality: ICardinality;
    private _service: any = null;

    constructor(
        ctx: IBundleContext,
        private config: any,
    ) {
        const { type } = config;
        this.cardinality = getCardinality(this, '1..1');
        this.tracker = ctx.serviceTracker(type, this.cardinality);
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
    addingService(reference: IServiceReference, service: any) {
        this._service = service;
    }

    modifiedService(reference: IServiceReference, service: any) {
    }

    removedService(reference: IServiceReference, service: any) {
        this._service = null;
    }
    isSatisfied() {
        return this.cardinality.isSatisfied();
    }
}

export class ReferenceDependency implements IDependency {

    private tracker: ServiceTracker
    private cardinality: ICardinality;

    constructor(
        private instanceWrapper: InstanceWrapper,
        private ctx: IBundleContext,
        private config: any,
    ) {
        const { type } = config;
        this.cardinality = getCardinality(this, '0..n');
        this.tracker = ctx.serviceTracker(type, this.cardinality);
    }
    public open() {
        this.tracker.open();
    }
    public close() {
        this.tracker.close();
    }
    addingService(reference: IServiceReference, service: any) {
        this.instanceWrapper.invoke(this.config.bind, reference, service);
    }

    modifiedService(reference: IServiceReference, service: any) {
    }

    removedService(reference: IServiceReference, service: any) {
        this.instanceWrapper.invoke(this.config.unbind, reference, service);
    }
    public isSatisfied() {
        return this.cardinality.isSatisfied();
    }
}
