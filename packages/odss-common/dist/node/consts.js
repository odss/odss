"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBJECTCLASS = 'objectclass';
exports.SERVICE_ID = 'service_id';
exports.Bundles = {
    UNINSTALLED: 1,
    INSTALLED: 2,
    RESOLVED: 4,
    STARTING: 8,
    STOPPING: 16,
    ACTIVE: 32 //now running
};
exports.Events = {
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
    MODIFIED_ENDMATCH: 8
};
