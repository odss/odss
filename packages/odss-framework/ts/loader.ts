declare var System: {
    normalize: (loc: string) => Promise<string>,
    import: (id: string) => Promise<string>
};

export default class Loader {

    static createDefaultLoader(path:string = '/'): Loader{
        return new Loader(path);
    }

    async loadBundle(location: string): Promise<any> {
        let id = await System.normalize(location);
        let module = await System.import(id);
        let config = {
            id: id,
            version: '0.0.0',
            resources: [],
            styles: [],
            templates: [],
            start: () => {},
            stop: () => {},
            location: location
        };
        for (let name of Object.keys(module)) {
            config[name.toLowerCase()] = module[name];
        }
        return config;
    }

    async unloadBundle(location: string) {
        let id = await System.normalize(location);
        return System.registry.delete(id);
    }
}
