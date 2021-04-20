import { IHandler, IComponentContainer } from '@odss/cdi-common';

interface IComponent {
    getInstance(): any;
    create(dependencies: any[]): any;
    invoke(name: string, args: any[]): void;
    set(name: string, value: any): void;
    dispose(): void;
}

export class BaseHandler implements IHandler {
    protected container: any = null;

    setup(container: IComponentContainer) {
        this.container = container;
    }
    open(): void {}
    close(): void {
        this.container = null;
    }
    isValid(): boolean {
        return true;
    }
    start(): void {}
    stop(): void {}
    preValidate(): void {}
    validate(): void {}
    postValidate(): void {}
    preInvalidate(): void {}
    invalidate(): void {}
    postInvalidate(): void {}
}
