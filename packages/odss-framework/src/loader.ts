import { ILoader } from "@odss/common";

class GenericLoader implements ILoader {
    private resolver: Function;
    constructor({ resolver }) {
        this.resolver = resolver ? resolver : name => name;
    }
    async loadBundle(location): Promise<any> {
        const path = await this.resolver(location);
        const module = typeof require === 'function' ? require(path) : await import(path);
        return { path, location, ...module };
    }
    async unloadBundle(location): Promise<void> {

    }
}

export function createDefaultLoader(properties): ILoader {
    return new GenericLoader(properties);
}
