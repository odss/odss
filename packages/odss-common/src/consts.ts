export const OBJECTCLASS = 'objectclass';
export const OBJECTCLASS_NAME = 'objectclassname';
export const SERVICE_ID = 'service_id';
export const SERVICE_RANKING = 'service_ranking';

export const Bundles = {
    UNINSTALLED: 1,
    INSTALLED: 2, //installed but not resolved
    RESOLVED: 4, //is able to start
    STARTING: 8, //actual starting
    STOPPING: 16, //actual stoping
    ACTIVE: 32, //now running
};
export const Events = {
    INSTALLED: 1,
    STARTED: 2,
    STOPPED: 4,
    UPDATED: 8,
    UNINSTALLED: 10,
    RESOLVED: 20,
    UNRESOLVED: 40,
    STARTING: 80,
    STOPPING: 100,
    REGISTERED: 1,
    MODIFIED: 2,
    UNREGISTERED: 4,
    MODIFIED_ENDMATCH: 8,
};

export const HandlerTypes = {
    FACTORY_HANDLER: 'odss.factory.handler',
    COMPONENT: 'odss.handler.component',
    PROVIDES: 'odss.handler.provides',
    PROPERTY: 'odss.handler.property',
    CONSTRUCTOR_DEPENDENCY: 'odss.handler.constructor.dependency',
    PROPERTIES_DEPENDENCY: 'odss.handler.properties.dependency',
    BIND_DEPENDENCY: 'odss.handler.bind',
    UNBIND_DEPENDENCY: 'odss.handler.unbind',
    MODIFIED_DEPENDENCY: 'odss.handler.modified',
    UPDATE_DEPENDENCY: 'odss.handler.update',
    INVALIDATE_METHOD: 'odss.handler.invalidate.method',
    VALIDATE_METHOD: 'odss.handler.validate.method',
    SHELL_COMMAND: "odss.shell.command",
};
