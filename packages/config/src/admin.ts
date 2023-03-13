import {
    IConfigAdmin,
    IConfig,
} from '@odss/common';
import { ConfigManager } from './manager';

export class ConfigAdmin implements IConfigAdmin {
    constructor(private manager: ConfigManager) {

    }
    async getConfig(pid: string): Promise<IConfig> {
        let config = await this.manager.getConfig( pid );
        if (!config) {
            config = await this.manager.createConfig( pid );
        }
        return config;
    }
    async createFactoryConfig(factoryPid: string, name?: string): Promise<IConfig> {
        const pid = factoryPid + ':' + (name || nextPid());
        return this.manager.createFactoryConfig(factoryPid, pid);
    }
    async listConfigs(filter: string = ''): Promise<IConfig[]> {
        return this.manager.listConfigs(filter);
    }
}
const nextPid = (() => {
    let id = 0;
    return () => (id += 1);
})();
