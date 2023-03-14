import {
    Properties,
    IConfigManaged,
    IConfigManagedFactory,
    IConfigAdmin,
    IConfig,
    IConfigStorage,
} from './types';

export class ConfigManagedService implements IConfigManaged {
    static readonly NAMESPACE = '@odss/common';
    updated(properties?: Properties) {
        throw new Error('Method not implemented.');
    }
}
export class ConfigManagedFactoryService implements IConfigManagedFactory {
    static readonly NAMESPACE = '@odss/common';
    updated(pid: string, properties: Properties) {
        throw new Error('Method not implemented.');
    }
    deleted(pid: string) {
        throw new Error('Method not implemented.');
    }
}
export class ConfigAdminService implements IConfigAdmin {
    static readonly NAMESPACE = '@odss/common';
    createFactoryConfig(factoryPid: string, name?: string): Promise<IConfig> {
        throw new Error('Method not implemented.');
    }
    getConfig(pid: string): Promise<IConfig> {
        throw new Error('Method not implemented.');
    }
    listConfigs(filter: string): Promise<IConfig[]> {
        throw new Error('Method not implemented.');
    }
}
export class ConfigStorageService implements IConfigStorage {
    static readonly NAMESPACE = '@odss/common';
    exists(pid: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    load(pid: string): Promise<Properties> {
        throw new Error('Method not implemented.');
    }
    store(pid: string, properties: Properties): Promise<void> {
        throw new Error('Method not implemented.');
    }
    remove(pid: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getPids(): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    keys(): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    loadAll(): Promise<Properties[]> {
        throw new Error('Method not implemented.');
    }
}
