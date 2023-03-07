import { IHandler, IComponentContainer } from '@odss/common';

export class BaseHandler implements IHandler {
    protected container: any = null;

    isValid(): boolean {
        return true;
    }
    async setup(container: IComponentContainer): Promise<void> {
        this.container = container;
    }
    async open(): Promise<void> {}
    async close(): Promise<void> {
        this.container = null;
    }
    async preValidate(): Promise<void> {}
    async validate(): Promise<void> {}
    async postValidate(): Promise<void> {}
    async preInvalidate(): Promise<void> {}
    async invalidate(): Promise<void> {}
    async postInvalidate(): Promise<void> {}
}
