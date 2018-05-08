declare var System: {
    normalize: (loc: string) => Promise<string>,
    import: (id: string) => Promise<string>,
    registry: {delete: Function}
};

export default class Loader {

    static createDefaultLoader(path:string = '/'): Loader {
        return new Loader();
    }

    async loadBundle(location: string): Promise<any> {
        let id = await System.normalize(location);
        let module = await System.import(id);
        return Object.assign({
            id,
            location
        }, module);
    }

    async unloadBundle(location: string) {
        let id = await System.normalize(location);
        return System.registry.delete(id);
    }
}
