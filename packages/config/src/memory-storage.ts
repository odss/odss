import { IConfigStorage, Properties } from '@odss/common';

export class MemoryConfigStorage implements IConfigStorage {
    private storage: Map<string, Properties> = new Map();

    async exists(pid: string): Promise<boolean> {
        return this.storage.has(pid);
    }
    async load(pid: string): Promise<Properties> {
        return this.storage.get(pid) as Properties;
    }
    async store(pid: string, properties: Properties): Promise<void> {
        this.storage.set(pid, properties);
    }
    async remove(pid: string): Promise<void> {
        this.storage.delete(pid);
    }
    async keys(): Promise<string[]> {
        return [...this.storage.keys()];
    }
    async loadAll(): Promise<Properties[]> {
        return [...this.storage.values()];
    }
}
