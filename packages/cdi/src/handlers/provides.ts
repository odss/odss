import { IServiceRegistration } from '@odss/common';
import {
    IFactoryContext,
    IHandler,
    IHandlerFactory,
    HandlerTypes,
    ProvideHandlerType,
} from '@odss/common';

import { BaseHandler } from './base';

export class ProviderHandlerFactory implements IHandlerFactory {
    getHandlers(factoryContext: IFactoryContext): IHandler[] {
        const providers = factoryContext.get<ProvideHandlerType[]>(HandlerTypes.PROVIDES) || [];
        return providers.map(({ tokens, properties }) => new ProviderHandler(tokens, properties));
    }
}

class ProviderHandler extends BaseHandler {
    private registration: IServiceRegistration = null;

    constructor(private tokens: any, private properties: any) {
        super();
    }

    async postValidate(): Promise<void> {
        const { context } = this.container.getBundle();
        this.registration = await context.registerService(
            this.tokens,
            this.container.getComponent().getInstance(),
            this.properties
        );
    }

    async preInvalidate(): Promise<void> {
        await this.registration.unregister();
        this.registration = null;
    }
}
