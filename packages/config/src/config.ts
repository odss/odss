import {
    SERVICE_PID,
    SERVICE_FACTORY_PID,
    IConfig,
    IConfigStorage,
    Properties,
} from '@odss/common';

import { ConfigManager } from './manager';

export class Config implements IConfig {
    static fromProperties(
        manager: ConfigManager,
        storage: IConfigStorage,
        properties: Properties
    ): Config {
        if (!properties[SERVICE_PID]) {
            throw Error(`Missing PID`);
        }
        const pid = properties[SERVICE_PID];
        const factoryPid = properties[SERVICE_FACTORY_PID];
        delete properties[SERVICE_PID];
        delete properties[SERVICE_FACTORY_PID];
        return new Config(manager, storage, properties, pid, factoryPid);
    }
    static async fromStore(
        manager: ConfigManager,
        storage: IConfigStorage,
        pid: string
    ): Promise<Config> {
        const properties = await storage.load(pid);
        if (properties[SERVICE_PID] !== pid) {
            throw Error(
                `Loaded PID(${properties[SERVICE_PID]}) doesn't match requested PID(${pid})`
            );
        }
        const factoryPid = properties[SERVICE_FACTORY_PID];
        delete properties[SERVICE_PID];
        delete properties[SERVICE_FACTORY_PID];
        return new Config(manager, storage, properties, pid, factoryPid);
    }
    static async createNew(
        manager: ConfigManager,
        storage: IConfigStorage,
        pid: string,
        factoryPid: string = ''
    ): Promise<Config> {
        const config = new Config(manager, storage, {}, pid, factoryPid);
        if (!factoryPid) {
            await config.store();
        }
        return config;
    }
    private empty: boolean;

    private constructor(
        private manager: ConfigManager,
        private storage: IConfigStorage,
        private properties: Properties,
        private pid: string,
        private factoryPid: string = ''
    ) {
        this.empty = Object.keys(properties).length === 0;
    }
    isNew(): boolean {
        return this.empty;
    }
    getProperties<T extends Properties>(extended: boolean = false): T {
        const properties = { ...this.properties };
        if (extended) {
            properties[SERVICE_PID] = this.pid;
            if (this.factoryPid) {
                properties[SERVICE_FACTORY_PID] = this.factoryPid;
            }
        }
        return properties as T;
    }
    getPid(): string {
        return this.pid;
    }
    getFactoryPid(): string {
        return this.factoryPid || '';
    }
    async update(properties?: Properties): Promise<void> {
        delete properties[SERVICE_PID];
        delete properties[SERVICE_FACTORY_PID];
        this.properties = properties;
        this.empty = false;
        await this.store();
        await this.manager.updated(this);
    }
    async reload(): Promise<void> {
        if (await this.storage.exists(this.pid)) {
            const properties = await this.storage.load(this.pid);
            if (properties[SERVICE_PID] !== this.pid) {
                throw Error(
                    `Loaded PID(${properties[SERVICE_PID]}) doesn't match requested PID(${this.pid})`
                );
            }
            delete properties[SERVICE_PID];
            delete properties[SERVICE_FACTORY_PID];
            this.properties = properties;
        }
        await this.manager.reloaded(this);
    }
    async remove(): Promise<void> {
        await this.storage.remove(this.pid);
        await this.manager.removed(this);
        this.properties = null;
        this.manager = null;
        this.storage = null;
    }
    private async store(): Promise<void> {
        await this.storage.store(this.pid, this.getProperties(true));
    }
}
