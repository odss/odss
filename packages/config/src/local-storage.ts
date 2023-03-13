import { IConfigStorage, Properties } from '@odss/common';

export class LocalConfigStorage implements IConfigStorage {

    static hasFeature(): boolean {
        return !!globalThis.localStorage;
    }

    constructor(private key: string = 'odss.cm') {}
    getKey(pid: string) {
        return `${this.key}.${pid}`;
    }

    async exists(pid: string): Promise<boolean> {
        return !! localStorage.getItem(this.getKey(pid));
    }
    async load(pid: string): Promise<Properties> {
        const data = localStorage.getItem(this.getKey(pid));
        if (data) {
            try {
                return JSON.parse(data);
            } catch(err) {
                console.warn(err);
            }
        }
        return {};
    }
    async store(pid: string, properties: Properties): Promise<void> {
        localStorage.setItem(this.getKey(pid), JSON.stringify(properties));
    }
    async remove(pid: string): Promise<void> {
        localStorage.removeItem(this.getKey(pid));
    }
    async keys(): Promise<string[]> {
        const size = localStorage.length;
        const pids: string[] = [];
        for(let i = 0; i < size; i+=1) {
            const pid = localStorage.key(i);
            if (pid?.startsWith(this.key)) {
                pids.push(pid.substring(this.key.length+1));
            }
        }
        return pids;
    }
    async loadAll(): Promise<Properties[]> {
        const pids = await this.keys();
        return await Promise.all(pids.map(pid => this.load(pid)));
    }
}
