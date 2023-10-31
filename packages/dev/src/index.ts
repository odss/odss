import { CommandsService, IBundleContext } from '@odss/common';

import { Config, State } from './types';
import { IStorage, LocalStorage, RemoteStorage } from './storage';
import { DevCommands } from './commands';
import { CONFIG_PREFIX, CONFIG_DEFAULT_NAME } from './consts';


export const activate = async (ctx: IBundleContext) => {
    const state = {
        running: true,
        shouldReload: false,
    };
    const localStorage = new LocalStorage(CONFIG_PREFIX);
    const remoteStorage = new RemoteStorage();
    const config = new ConfigController(remoteStorage, localStorage);
    const app = await config.getCurrentApp();
    if (app) {
        for(const bundle of app.bundles) {
            ctx.installBundle(bundle, true);
        }
    }
    const disposeable = [
        connectToDevServer(state),
        attachVisibleEvents(state),
    ];

    ctx.registerService(CommandsService, new DevCommands(ctx, config));

    return () => {
        state.running = false;
        for(const dispose of disposeable) {
            dispose();
        }
    };
}

class ConfigController {
    constructor(private remoteStorage: IStorage, private localStorage: IStorage) {

    }
    async getCurrentApp() {
        const config = await this.remoteStorage.load<Config>('config');
        const defaultApp = await this.localStorage.load<string>('defaultApp');
        const name = this.findConfigName(defaultApp, config);
        return config.apps[name];
    }
    async setCurrentApp(name: string) {
        await this.localStorage.write('defaultApp', name);
    }
    async getCurrentAppName() {
        const config = await this.remoteStorage.load<Config>('config');
        const defaultApp = await this.localStorage.load<string>('defaultApp');
        return this.findConfigName(defaultApp, config);
    }
    async getAvailableApps() {
        const config = await this.remoteStorage.load<Config>('config');
        return Object.keys(config.apps);
    }
    async selectApp(name: string) {
        const prev = await this.getCurrentApp();
        await this.localStorage.save<string>('defaultApp', name);
        const current = await this.getCurrentApp();
        return { prev, current }
    }
    private findConfigName(defaultApp: string, config: Config): string {
        const m = location.search.match(/\$app=([a-z\.]+)/i);
        return m ? m[1] : defaultApp || config.defaultApp || CONFIG_DEFAULT_NAME;
    }
}

function connectToDevServer(state: State) {
    const ws = new WebSocket(`ws://${location.host}/`);

    ws.addEventListener('open', () => {
        console.log('Connection to dev server is ready');
    });
    ws.addEventListener('close', (event) => {
        console.log('Connection to dev server is closed', event);
        setTimeout(() => {
            if (state.running) {
                connectToDevServer(state);
            }
        }, 1000);
    });

    function messageHandler(event) {
        console.log(event.data);
        try {
            const { cmd, data } = JSON.parse(event.data || {});
            if (cmd === 'update') {
                if (document.hidden) {
                    state.shouldReload = true;
                } else {
                    console.log('Reload app');
                    location.reload();
                }
            }
        } catch(err) {
            console.error(err);
        }
    }
    ws.addEventListener('message', messageHandler);
    return () => ws.close();
}


function attachVisibleEvents(state: State) {
    function messageHandler() {
        if(!document.hidden && state.shouldReload) {
            state.shouldReload = false;
            console.log('Reload app');
            location.reload();
        }
    }
    window.addEventListener('visibilitychange', messageHandler, false);
    return () => window.removeEventListener('visibilitychange', messageHandler);
}
