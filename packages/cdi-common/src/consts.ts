export const HandlerTypes = {
    FACTORY_HANDLER: 'odss.factory.handler',
    COMPONENT: 'odss.handler.component',
    PROVIDES: 'odss.handler.provides',
    PROPERTY: 'odss.handler.property',
    DEPENDENCY: 'odss.handler.dependency',
    BIND: 'odss.handler.bind',
    VALIDATE: 'odss.handler.validate',

    CONSTRUCTOR_DEPENDENCY: 'odss.handler.constructor.dependency',
    PROPERTIES_DEPENDENCY: 'odss.handler.properties.dependency',
    BIND_DEPENDENCY: 'odss.handler.bind',
    UNBIND_DEPENDENCY: 'odss.handler.unbind',
    MODIFIED_DEPENDENCY: 'odss.handler.modified',
    UPDATE_DEPENDENCY: 'odss.handler.update',
    INVALIDATE_METHOD: 'odss.handler.invalidate.method',
    VALIDATE_METHOD: 'odss.handler.validate.method',
};

export const FACTORY_CONTEXT = 'odss.factory.context';

export const IHandlerService = 'odss.cdi.handler';
export const IHandlerFactoryService = 'odss.cdi.handler.factory';
