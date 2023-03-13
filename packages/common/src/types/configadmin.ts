import { SERVICE_FACTORY_PID, SERVICE_PID } from '../consts';
import { Properties } from './core';

export interface IConfigStorage {
    exists(pid: string): Promise<boolean>;
    load(pid: string): Promise<Properties>;
    store(pid: string, properties: Properties): Promise<void>;
    remove(pid: string): Promise<void>;
    keys(): Promise<string[]>;
    loadAll(): Promise<Properties[]>;
}

export interface IConfig {
    getPid(): string;
    getFactoryPid(): string;
    getProperties<T extends Properties>(extended?: boolean): T;
    update(properties?: Properties): Promise<void>;
    reload(): Promise<void>;
    remove(): Promise<void>;
}

export interface IConfigAdmin {
    getConfig(pid: string): Promise<IConfig>;
    createFactoryConfig(factoryPid: string, name?: string): Promise<IConfig>;
    listConfigs(filter: string): Promise<IConfig[]>;
}

export interface IConfigManaged {
    updated(properties?: Properties): Promise<void> | void;
}

export interface IConfigManagedFactory {
    updated(pid: string, properties: Properties): Promise<void> | void;
    deleted(pid: string): Promise<void> | void;
}
