import { IConfigStorage, IConfig, IConfigManagedFactory, IConfigManaged, Properties } from "@odss/common";
import { Config } from "./config";

export class ConfigManager {
    private configs: Map<string, Config> = new Map();
    private factories: Map<string, Set<Config>> = new Map();
    private managedServices: Map<string, IConfigManaged> = new Map();
    private managedFactories: Map<string, IConfigManagedFactory> = new Map();

    constructor(private storage: IConfigStorage) {}

    async open(): Promise<void> {
        const pids = await this.storage.keys();
        await Promise.all(pids.map(pid => this.getConfig(pid)));
    }

    async close(): Promise<void> {
        this.configs = null;
        this.factories = null;
        this.managedServices = null;
        this.managedFactories = null;
    }

    async addService(pid: string, service: IConfigManaged) {
        if (this.managedServices.has(pid)) {
            throw new Error(`ConfigManagedService with PID(${pid}) already registered`);
        }
        this.managedServices.set(pid, service);
        const config = await this.getConfig(pid);
        if (config) {
            await this.notifyServices([service], config);
        }
    }
    removeService(pid: string, service: IConfigManaged) {
        this.managedServices.delete(pid);
    }
    async addFactoryService(fid: string, service: IConfigManagedFactory) {
        if (this.managedFactories.has(fid)) {
            throw new Error(`ConfigManagedFactoryService with FID(${fid}) already registered`);
        }
        this.managedFactories.set(fid, service);
        const configs = this.factories.has(fid) ? [...this.factories.get(fid)] : [];
        await this.notifyFactories([service], configs);
    }
    removeFactoryService(pid: string, service: IConfigManagedFactory) {
        this.managedFactories.delete(pid);
    }

    async listConfigs(filter: string): Promise<IConfig[]> {
        const data = await this.storage.loadAll();
        for(const properties of data) {
            const config = Config.fromProperties(this, this.storage, properties);
            if (!this.configs.has(config.getPid())) {
                this.configs.set(config.getPid(), config);
            }
        }
        return [...this.configs.values()];
    }
    /**
     * Create a config for the given PID
     *
     * @param pid
     * @returns
     */
    async createConfig(pid: string): Promise<Config> {
        if (this.configs.has(pid)) {
            throw new Error(`Config PID(${pid}) already registered`);
        }
        const newConfig = await Config.createNew(this, this.storage, pid); // no, we need create new one
        this.configs.set(pid, newConfig);
        return newConfig;
    }

    /**
     * Return config with the given PID if exists in cache or in storage.
     * Overwise null is returned.
     *
     * @param pid
     * @returns
     */
    async getConfig(pid: string): Promise<Config | null> {
        if (!this.configs.has(pid)) {
            if (await this.storage.exists(pid)) {
                const config = await Config.fromStore(this, this.storage, pid);
                this.configs.set(pid, config);
                const factoryPid = config.getFactoryPid();
                if (factoryPid) {
                    if (!this.factories.has(factoryPid)) {
                        this.factories.set(factoryPid, new Set());
                    }
                    this.factories.get(factoryPid).add(config);
                }
            }
        }
        return this.configs.get(pid) || null;
    }

    async createFactoryConfig(factoryPid: string, pid: string): Promise<Config> {
        if (this.configs.has(pid)) {
            return this.configs.get(pid);
        }
        const config = await Config.createNew(this, this.storage, pid, factoryPid);
        this.configs.set(pid, config);
        if (!this.factories.has(factoryPid)) {
            this.factories.set(factoryPid, new Set());
        }
        this.factories.get(factoryPid).add(config);
        return config;
    }
    async updated(config: Config) {
        const pid = config.getPid();
        const factoryPid = config.getFactoryPid();
        if (factoryPid) {
            const factories = this.getMatchedFactories(factoryPid);
            await this.notifyFactories(factories, [config]);
        } else {
            const services = this.getMatchedServices(pid);
            await this.notifyServices(services, config);
        }
    }
    async reloaded(config: Config) {
        await this.updated(config);
    }

    async removed(config: Config) {
        const pid = config.getPid();
        const factoryPid = config.getFactoryPid();
        this.configs.delete(pid);
        if (factoryPid) {
            this.factories.get(factoryPid).delete(config);
            if (this.factories.get(factoryPid).size === 0) {
                this.factories.delete(factoryPid);
            }
        }
        if (factoryPid) {
            const factories = this.getMatchedFactories(factoryPid);
            await this.notifyFactoriesRemove(factories, [config]);
        } else {
            const services = this.getMatchedServices(pid);
            await this.notifyServices(services, config);
        }
    }
    private getMatchedServices(pid: string): IConfigManaged[] {
        return this.managedServices.has(pid) ? [this.managedServices.get(pid)] : [];
    }
    private getMatchedFactories(factoryPid: string): IConfigManagedFactory[] {
        return this.managedFactories.has(factoryPid) ? [this.managedFactories.get(factoryPid)] : [];
    }
    private async notifyFactories(
        factories: IConfigManagedFactory[],
        configs: Config[],
    ) {
        for(const config of configs) {
            if (config.isNew()) {
                continue;
            }
            const pid = config.getPid();
            const properties = config.getProperties();
            for (const factory of factories) {
                try {
                    await factory.updated(pid, properties);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
    private async notifyFactoriesRemove(factories: IConfigManagedFactory[], configs: Config[]) {
        for(const config of configs) {
            if (config.isNew()) {
                continue;
            }
            const pid = config.getPid();
            for (const factory of factories) {
                try {
                    await factory.deleted(pid);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
    private async notifyServices(services: IConfigManaged[], config: Config) {
        if (!config.isNew()) {
            const properties = config.getProperties();
            for (const service of services) {
                try {
                    await service.updated(properties);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
}