import * as fs from 'fs/promises';
import path from 'path';

import { IConfigStorage, Properties } from '@odss/common';

export class JsonConfigStorage implements IConfigStorage {
    constructor(private dir: string) {}
    async exists(pid: string): Promise<boolean> {
        const filePath = this.getFilePath(pid);
        try {
            const stat = await fs.stat(filePath);
            return stat.isFile();
        } catch (e) {
            console.log(`Not found file: ${filePath}`);
        }
        return false;
    }
    async load(pid: string): Promise<Properties> {
        const filePath = this.getFilePath(pid);
        const body = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(body);
    }
    async store(pid: string, properties: Properties): Promise<void> {
        const filePath = this.getFilePath(pid);
        const data = JSON.stringify(properties);
        await fs.writeFile(filePath, data, 'utf-8');
    }
    async remove(pid: string): Promise<void> {
        const filePath = this.getFilePath(pid);
        await fs.unlink(filePath);
    }
    async keys(): Promise<string[]> {
        const files = await fs.readdir(this.dir);
        return files
            .filter(file => file.endsWith('.config.json'))
            .map(file => file.substring(0, file.length - 12));
    }
    async loadAll(): Promise<Properties[]> {
        const pids = await this.keys();
        return Promise.all(pids.map(pid => this.load(pid)));
    }
    private getFilePath(pid: string) {
        return path.join(this.dir, `${pid}.config.json`);
    }
}
