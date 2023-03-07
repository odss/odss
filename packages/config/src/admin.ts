import {
    SERVICE_PID,
    SERVICE_FACTORY_PID,
    IConfigAdmin,
    IConfiguration,
    IConfigStorage,
    IConfigManaged,
    IConfigManagedFactory,
    Properties,
} from '@odss/common';

type TPID = string;
interface IConfigDirectory {
    add(pid: TPID, properties: Properties, storage: IConfigStorage): Promise<IConfiguration>;
    update(pid: TPID, properties: Properties): Promise<void>;
}

class ConfigDirectory implements IConfigDirectory {
    private configurations: Map<TPID, IConfiguration> = new Map();
    private fatories: Map<string, Set<IConfiguration>> = new Map();
    constructor(private admin: ConfigAdmin) {}
    async add(
        pid: string,
        properties: Properties,
        storage: IConfigStorage,
        factoryPid: TPID = null
    ): Promise<IConfiguration> {
        if (this.configurations.has(pid)) {
            throw new Error(`Already exists configuration: ${pid}`);
        }
        const configuration = new Configuration(this.admin, storage, pid, factoryPid);
        await configuration.update(properties);

        if (factoryPid) {
            if (!this.fatories.has(factoryPid)) {
                this.fatories.set(factoryPid, new Set());
            }
            this.fatories.get(factoryPid).add(configuration);
        }

        this.configurations.set(pid, configuration);
        return configuration;
    }
    async update(pid: string, properties: Properties): Promise<void> {
        await this.configurations.get(pid).update(properties);
    }
    async remove(pid: string): Promise<void> {
        const configuration = this.configurations.get(pid);
        this.configurations.delete(pid);
        const factoryPid = configuration.getFactoryPid();
        if (factoryPid) {
            if (this.fatories.has(factoryPid)) {
                this.fatories.get(factoryPid).delete(configuration);
            }
        }
        await configuration.remove();
    }
    getConfiguration(pid: string): IConfiguration {
        return this.configurations.get(pid);
    }
    getFactoryConfigurations(factoryPid: string) {
        const configurations = this.fatories.get(factoryPid);
        if (configurations) {
            return [...configurations];
        }
        return [];
    }
    listConfigurations(filter: string): IConfiguration[] {
        return [...this.configurations.values()];
    }
}

class Configuration implements IConfiguration {
    private properties: Properties = null;
    private _isRemove: boolean = false;

    constructor(
        private admin: ConfigAdmin,
        private storage: IConfigStorage,
        private pid: TPID,
        private factoryPid: TPID = ''
    ) {
        this.pid = pid;
        this.factoryPid = factoryPid;
    }
    getProperties(): Properties {
        return this.properties;
    }
    getPid(): TPID {
        return this.pid;
    }
    getFactoryPid(): TPID {
        return this.factoryPid;
    }
    async update(properties: Properties): Promise<void> {
        if (this.updateProperties(properties)) {
            this.storage.store(this.getPid(), properties);
            this.admin.updated(this, true);
        }
    }
    async reload(): Promise<void> {
        if (await this.storage.exists(this.getPid())) {
            this.properties = await this.storage.load(this.getPid());
        }
        this.admin.updated(this, false);
    }
    async remove(): Promise<void> {
        this._isRemove = true;
        await this.admin.removed(this);
        await this.storage.remove(this.getPid());
        this.properties = null;
    }
    private async updateProperties(properties: Properties) {
        properties = copyProperties(properties);

        properties[SERVICE_PID] = this.getPid();

        const factoryPid = this.getFactoryPid();
        if (factoryPid) {
            properties[SERVICE_FACTORY_PID] = factoryPid;
        }

        if (!equalProperties(properties, this.properties)) {
            this.properties = properties;
            return true;
        }
        return false;
    }
}
function copyProperties(properties: Properties): Properties {
    return JSON.parse(JSON.stringify(properties));
}
function equalProperties(p1: Properties, p2: Properties) {
    return JSON.stringify(p1) === JSON.stringify(p2);
}

export class ConfigAdmin implements IConfigAdmin {
    private storages: IConfigStorage[] = [];
    private services: Set<IConfigManaged> = new Set();
    private factories: Set<IConfigManagedFactory> = new Set();

    private directory: ConfigDirectory = new ConfigDirectory(this);
    constructor() {}
    async updated(configuration: IConfiguration, notify: boolean = false): Promise<void> {
        await this.update(configuration);
    }
    async removed(configuration: IConfiguration): Promise<void> {
        const pid = configuration.getPid();
        const factoryPid = configuration.getFactoryPid();
        if (factoryPid) {
            const factories = this.getMatchedFactories(factoryPid);
            // await
            this.notifyFactoriesRemove(factories, pid);
        } else {
            const services = this.getMatchedServices(factoryPid);
            // await
            this.notifyServices(services, null);
        }
    }
    async addStorage(storage: IConfigStorage) {
        this.storages.push(storage);
        const pids = await storage.getPids();
        await this.notifyPids(pids);
    }
    removeStorage(storage: IConfigStorage) {
        const index = this.storages.indexOf(storage);
        if (index !== -1) {
            this.storages.splice(index, 1);
        }
    }

    addService(pid: string, service: IConfigManaged) {
        this.services.add(service);
        this.notifyService(pid, service);
    }
    removeService(pid: string, service: IConfigManaged) {
        this.services.delete(service);
    }
    addFactoryService(pid: string, factory: IConfigManagedFactory) {
        this.factories.add(factory);
        this.notifyFactory(pid, factory);
    }
    removeFactoryService(pid: string, factory: IConfigManagedFactory) {
        this.factories.delete(factory);
    }
    private async notifyPids(pids: TPID[]): Promise<void> {
        for (const pid of pids) {
            const configuration = await this.getConfiguration(pid);
            try {
                await this.update(configuration);
            } catch (e) {
                console.error(e);
            }
        }
    }
    private async update(configuration: IConfiguration): Promise<void> {
        const pid = configuration.getPid();
        const factoryPid = configuration.getFactoryPid();
        const properties = configuration.getProperties();
        if (factoryPid) {
            const factories = this.getMatchedFactories(factoryPid);
            // await
            this.notifyFactories(factories, pid, properties);
        } else {
            const services = this.getMatchedServices(factoryPid);
            // await
            this.notifyServices(services, properties);
        }
    }
    private getMatchedFactories(factoryPid: string): IConfigManagedFactory[] {
        return [];
    }
    private getMatchedServices(pid: string): IConfigManaged[] {
        return [];
    }
    private async notifyFactory(pid: TPID, factory: IConfigManagedFactory) {
        const configurations = this.directory.getFactoryConfigurations(pid);
        for (const configuration of configurations) {
            try {
                factory.updated(configuration.getPid(), configuration.getProperties());
            } catch (e) {
                console.error(e);
            }
        }
    }
    private async notifyFactories(
        factories: IConfigManagedFactory[],
        pid: TPID,
        properties: Properties
    ) {
        for (const factory of factories) {
            try {
                await factory.updated(pid, properties);
            } catch (e) {
                console.error(e);
            }
        }
    }
    private async notifyFactoriesRemove(factories: IConfigManagedFactory[], pid: TPID) {
        for (const factory of factories) {
            try {
                await factory.deleted(pid);
            } catch (e) {
                console.error(e);
            }
        }
    }
    private async notifyService(pid: string, service: IConfigManaged) {
        const configuration = await this.getConfiguration(pid);
        try {
            await service.updated(configuration.getProperties());
        } catch (e) {
            console.error(e);
        }
    }
    private async notifyServices(services: IConfigManaged[], properties: Properties) {
        for (const service of services) {
            try {
                await service.updated(properties);
            } catch (e) {
                console.error(e);
            }
        }
    }
    async getConfiguration(pid: string): Promise<IConfiguration> {
        const configuration = this.directory.getConfiguration(pid);
        if (configuration) {
            return configuration;
        }
        for (const storage of this.storages) {
            if (await storage.exists(pid)) {
                const properties = await storage.load(pid);
                const factoryPid = properties[SERVICE_FACTORY_PID];
                return this.directory.add(pid, properties, storage, factoryPid);
            }
        }
        return this.directory.add(pid, {}, this.storages[0]);
    }
    createFactoryConfiguration(factoryPid: string): Promise<IConfiguration> {
        const pid = `${factoryPid}-${nextPid()}`;
        return this.directory.add(pid, {}, this.storages[0], factoryPid);
    }
    listConfigurations(filter: string): IConfiguration[] {
        return this.directory.listConfigurations(filter);
    }
}

const nextPid = (() => {
    let id = 0;
    return () => (id += 1);
})();
