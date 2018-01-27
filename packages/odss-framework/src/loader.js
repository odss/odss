export default class Loader {
    static createDefaultLoader(path = '/') {
        return new Loader(path);
    }
    constructor(path = '') {
    }
    async loadBundle(location) {
        let id = await System.normalize(location);
        let module = await System.import(id);
        let config = {
            id,
            location
        };
        for (let name of Object.keys(module)) {
            config[name] = module[name];
        }
        return config;
    }
    async unloadBundle(location) {
        let id = await System.normalize(location);
        return System.registry.delete(id);
    }
}
