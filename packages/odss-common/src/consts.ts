export const OBJECTCLASS = 'objectclass';
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

export const MetadataHandlers = {
    COMPONENT: 'odss.handler.component',
    PROVIDES: 'odss.hadler.provides',
    PROPERTY: 'odss.hadler.property',
    CONSTRUCTOR_DEPENDENCY: 'odss.hadler.params.dependency',
    PROPERTIES_DEPENDENCY: 'odss.hadler.properties.dependency',
    INVALIDATE_METHOD: 'odss.hadler.invalidate.method',
    VALIDATE_METHOD: 'odss.hadler.validate.method',
    BIND_DEPENDENCY: 'odss.hadler.bind',
    UNBIND_DEPENDENCY: 'odss.hadler.unbind',
    MODIFIED_DEPENDENCY: 'odss.hadler.modified',
    UPDATE_DEPENDENCY: 'odss.hadler.update',
};
