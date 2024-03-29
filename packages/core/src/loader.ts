import { IModule, ILoader } from '@odss/common';

interface IResolver {
    (id: string): string;
}

class GenericLoader implements ILoader {
    private resolver: IResolver;

    constructor({ resolver }) {
        this.resolver = resolver ? resolver : name => name;
    }
    async loadBundle(name: string): Promise<IModule> {
        const path = await this.resolver(name);
        const url = this.getUrl(path);
        const module = typeof require === 'function' ? require(url) : await import(url);
        return Object.freeze({ path, name, url, ...module });
    }
    async unloadBundle(): Promise<void> {
        // pass
    }

    getUrl(path) {
        const time = new Date().getTime();
        const sign = path.includes('?') ? '&' : '?';
        return [path, sign, time].join('');
    }
}

export function createDefaultLoader(properties: any): ILoader {
    return new GenericLoader(properties);
}
