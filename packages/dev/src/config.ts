import { Config, ConfigApp} from './types';
import { IStorage } from './storage';
import { CONFIG_DEFAULT_NAME } from './consts';


export class ConfigController {
    constructor(private remoteStorage: IStorage, private localStorage: IStorage) {

    }
    async getCurrentApp(): Promise<ConfigApp> {
        const config = await this.remoteStorage.read<Config>('config');
        const defaultApp = await this.localStorage.read<string>('defaultApp');
        return config.apps[defaultApp];
    }
    async setCurrentApp(name: string): Promise<void> {
        await this.localStorage.write('defaultApp', name);
    }
    async getCurrentAppName() {
        return this.localStorage.read<string>('defaultApp');
    }
    async getAvailableApps() {
        const config = await this.remoteStorage.read<Config>('config');
        return Object.keys(config.apps);
    }
    async selectApp(name: string) {
        const prev = await this.getCurrentApp();
        await this.localStorage.write<string>('defaultApp', name);
        const current = await this.getCurrentApp();
        return { prev, current }
    }
    async updateCurrentApp(app: ConfigApp): Promise<void> {
        const config = await this.remoteStorage.read<Config>('config');
        const defaultApp = await this.localStorage.read<string>('defaultApp');
        config.apps[defaultApp] = app;
        await this.remoteStorage.write('config', config);
    }
    private findConfigName(defaultApp: string): string {
        const m = location.search.match(/\$app=([a-z\.]+)/i);
        return m ? m[1] : defaultApp || config.defaultApp || CONFIG_DEFAULT_NAME;
    }
}
