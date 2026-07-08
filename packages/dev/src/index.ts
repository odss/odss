import { CommandsService, IBundleContext } from '@odss/common';

import { State } from './types';
import { LocalStorage, RemoteStorage } from './storage';
import { DevCommands } from './commands';
import { CONFIG_PREFIX, CONFIG_DEFAULT_NAME } from './consts';
import { ConfigController } from './config';

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
            try {
                await ctx.installBundle(bundle, true);
            } catch(err) {
                console.log(err)
            }
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
