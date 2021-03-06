const NODE_ENV = 'node.env';
const BROWSER_ENV = 'browser.env';
const UNKNOWN_ENV = 'unknown.env';
const WEBWORKER_ENV = 'webworker.env';
class NodeLoader {
    constructor({ resolver }) {
        this.resolver = resolver;
    }
    async loadBundle(location) {
        const id = await this.resolver(location);
        const module = await import(id);
        return Object.assign({
            id,
            location
        }, module);
    }
    async unloadBundle(location) {
    }
}
class BrowserLoader {
    async loadBundle(location) {
        const id = await System.resolve(location);
        let module = await System.import(id);
        return Object.assign({
            id,
            location
        }, module);
    }
    async unloadBundle(location) {
        let id = await System.resolve(location);
        return System.registry.delete(id);
    }
}
const LOADERS = {
    [NODE_ENV]: NodeLoader,
    [BROWSER_ENV]: BrowserLoader,
};
export function createDefaultLoader(options) {
    const env = detectEnv();
    const Loader = LOADERS[env];
    return new Loader(options);
}
function detectEnv() {
    if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
        return NODE_ENV;
    }
    else if (typeof window !== 'undefined') {
        return BROWSER_ENV;
    }
    else if (typeof importScripts === 'function') {
        return WEBWORKER_ENV;
    }
    return UNKNOWN_ENV;
}
