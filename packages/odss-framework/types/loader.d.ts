export default class Loader {
    static createDefaultLoader(path?: string): Loader;
    loadBundle(location: string): Promise<any>;
    unloadBundle(location: string): Promise<any>;
}
