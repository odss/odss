import { ILoader } from '@odss/common';

class GenericLoader implements ILoader {
    private resolver: Function;

    constructor({ resolver }) {
        this.resolver = resolver ? resolver : name => name;
    }
    async loadBundle(location): Promise<any> {
        const path = await this.resolver(location);
        const url = this.getUrl(path);
        const module = typeof require === 'function' ? require(url) : await import(url);
        return { path, location, ...module };
    }
    async unloadBundle(location): Promise<void> {}
    getUrl(path) {
        const time = new Date().getTime();
        const sign = path.includes('?') ? '&' : '?';
        return [path, sign, time].join('');
    }
}

export function createDefaultLoader(properties): ILoader {
    return new GenericLoader(properties);
}
