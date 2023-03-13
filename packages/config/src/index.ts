import { IServiceRegistration, IBundleContext, ConfigStorageService, IConfigManaged, Properties, SERVICE_RANKING } from '@odss/common';
import { ConfigStorageTracker } from './trackers';
import { MemoryConfigStorage } from './memory-storage';
import { LocalConfigStorage } from './local-storage';
import { Supervisor } from './supervisor';

export class Activator {
    private regs: IServiceRegistration[] = [];
    private tracker: ConfigStorageTracker;

    async start(ctx: IBundleContext) {
        this.tracker = new ConfigStorageTracker(ctx, new Supervisor(ctx));
        await this.tracker.open();
        if (LocalConfigStorage.hasFeature()) {
            this.regs.push(
                await ctx.registerService(
                    ConfigStorageService,
                    new LocalConfigStorage(),
                    { name: 'local-storage', [SERVICE_RANKING]: -100 }
                )
            );
        } else {
            this.regs.push(
                await ctx.registerService(
                    ConfigStorageService,
                    new MemoryConfigStorage(),
                    { name: 'memory', [SERVICE_RANKING]: -100 }
                )
            );
        }

    }
    async stop() {
        await this.tracker.close();
        for (const reg of this.regs) {
            await reg.unregister();
        }
    }
}
