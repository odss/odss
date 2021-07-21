import { IFactoryContext, IHandler, IHandlerFactory, HandlerTypes } from '@odss/common';

import { BaseHandler } from './base';

export class CallbacksHandlerFactory implements IHandlerFactory {
    getHandlers(factoryContext: IFactoryContext): IHandler[] {
        const handlers: IHandler[] = [];

        const { name: validMethodName } = factoryContext.get(HandlerTypes.VALIDATE_METHOD) || {};
        if (validMethodName) {
            handlers.push(new ValidateHandler(validMethodName));
        }

        const { name: invalidMethodName } =
            factoryContext.get(HandlerTypes.INVALIDATE_METHOD) || {};
        if (validMethodName) {
            handlers.push(new InvalidateHandler(invalidMethodName));
        }
        return handlers;
    }
}

class ValidateHandler extends BaseHandler {
    constructor(private name: string) {
        super();
    }
    async validate(): Promise<void> {
        await this.container.getComponent().invoke(this.name, [this.container.getBundleContext()]);
    }
}
class InvalidateHandler extends BaseHandler {
    constructor(private name: string) {
        super();
    }
    async invalidate(): Promise<void> {
        await this.container.getComponent().invoke(this.name, [this.container.getBundleContext()]);
    }
}
