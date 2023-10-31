export default class EventDispatcher {
    framework: any;
    bundle: any;
    service: any;
    constructor();
    fireEvent(event: any): Promise<void>;
    cleanBundle(bundle: any): void;
    reset(): void;
}
