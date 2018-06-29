import { IEvent, IServiceEvent, IBundleEvent, IBundle, IServiceReference } from './interfaces';
export declare class Event implements IEvent {
    type: number;
    constructor(type: number);
    toString(): string;
}
export declare class BundleEvent extends Event implements IBundleEvent {
    bundle: IBundle;
    constructor(type: number, bundle: IBundle);
    toString(): string;
}
export declare class FrameworkEvent extends BundleEvent {
    toString(): string;
}
export declare class ServiceEvent extends Event implements IServiceEvent {
    readonly reference: IServiceReference;
    readonly properties: any;
    constructor(type: number, reference: IServiceReference, properties?: any);
    toString(): string;
}
