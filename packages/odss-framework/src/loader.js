export default class Loader {
    static createDefaultLoader(path = '/') {
        return new Loader();
    }
    async loadBundle(location) {
        let id = await System.normalize(location);
        let module = await System.import(id);
        return Object.assign({
            id,
            location
        }, module);
    }
    async unloadBundle(location) {
        let id = await System.normalize(location);
        return System.registry.delete(id);
    }
}
