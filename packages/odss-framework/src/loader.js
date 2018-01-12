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
            id: id,
            version: '0.0.0',
            resources: [],
            styles: [],
            templates: [],
            start: () => { },
            stop: () => { },
            location: location
        };
        for (let name of Object.keys(module)) {
            config[name.toLowerCase()] = module[name];
        }
        return config;
    }
}
