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
        return new Config(manager, storage, properties, properties[SERVICE_PID]);
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
        return new Config(manager, storage, properties, pid);
    }
    static async createNew(
        manager: ConfigManager,
        storage: IConfigStorage,
        pid: string,
        factoryPid: string = ''
    ): Promise<Config> {
        const config = new Config(manager, storage, null, pid, factoryPid);
        if (!factoryPid) {
            await config.store();
        }
        return config;
    }
    private properties: Properties;
    private _isNew: boolean;

    private constructor(
        private manager: ConfigManager,
        private storage: IConfigStorage,
        properties: Properties | null,
        private pid: string,
        private factoryPid: string = ''
    ) {
        this._isNew = properties === null;
        properties = properties || {};
        this.properties = {
            ...properties,
            [SERVICE_PID]: pid,
        };
        if (factoryPid) {
            this.properties[SERVICE_FACTORY_PID] = factoryPid;
        }
    }
    isNew(): boolean {
        return this._isNew;
    }
    getProperties<T extends Properties>(): T {
        return JSON.parse(JSON.stringify(this.properties));
    }
    getPid(): string {
        return this.pid;
    }
    getFactoryPid(): string {
        return this.factoryPid || '';
    }
    async update(properties?: Properties): Promise<void> {
        this.properties = {
            ...properties,
            [SERVICE_PID]: this.pid,
        };
        if (this.factoryPid) {
            this.properties[SERVICE_FACTORY_PID] = this.factoryPid;
        }
        this._isNew = false;
        await this.storage.store(this.pid, this.properties);
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
        await this.storage.store(this.getPid(), this.properties);
    }
}
