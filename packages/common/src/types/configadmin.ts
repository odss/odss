import { Properties } from './core';

export interface IConfigStorage {
    exists(pid: string): Promise<boolean>;
    load(pid: string): Promise<Properties>;
    store(pid: string, properties: Properties): Promise<void>;
    remove(pid: string): Promise<void>;
    getPids(): Promise<string[]>;
}

export interface IConfiguration {
    getProperties(): Properties;
    getPid(): string;
    getFactoryPid(): string;
    update(properties?: Properties): Promise<void>;
    reload(): Promise<void>;
    remove(): Promise<void>;
}

export interface IConfigDirectory {
    remove(pid: string): Promise<void>;
    add(pid: string, properties: Properties): Promise<IConfiguration>;
    update(pid: string, properties: Properties): Promise<void>;
}

export interface IConfigAdmin {
    getConfiguration(pid: string): Promise<IConfiguration>;
    createFactoryConfiguration(factoryPid: string): Promise<IConfiguration>;
    listConfigurations(filter: string): IConfiguration[];
}

export interface IConfigManaged {
    updated(properties?: Properties);
}

export interface IConfigManagedFactory {
    updated(pid: string, properties: Properties);
    deleted(pid: string);
}
