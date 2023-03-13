import { IConfigStorage, IBundleContext, ConfigAdminService, IServiceRegistration, ShellCommandsService } from "@odss/common";
import { ConfigManager } from './manager';
import { ConfigAdmin } from "./admin";
import { ConfigManagedFactoryTracker, ConfigManagedTracker } from "./trackers";
import { AdminConfigCommands } from './commands';

export class Supervisor {
    private manager: ConfigManager;
    private adminRegistration: IServiceRegistration;
    private trackersFactories: ConfigManagedFactoryTracker;
    private trackersServices: ConfigManagedTracker;

    constructor(private ctx: IBundleContext) {

    }
    async setStorage(storage: IConfigStorage): Promise<void> {

        this.manager = new ConfigManager(storage);
        await this.manager.open();

        const admin = new ConfigAdmin(this.manager);
        this.adminRegistration = await this.ctx.registerService(ConfigAdminService, admin);
        this.trackersFactories = new ConfigManagedFactoryTracker(this.ctx, this.manager);
        this.trackersServices = new ConfigManagedTracker(this.ctx, this.manager);
        await this.trackersFactories.open();
        await this.trackersServices.open();
        this.ctx.registerService(ShellCommandsService, new AdminConfigCommands(admin));
    }
    async unsetStorage(): Promise<void> {
        await this.trackersServices?.close();
        await this.trackersFactories?.close();
        await this.adminRegistration?.unregister();
        this.trackersServices = null;
        this.trackersFactories = null;
        this.adminRegistration = null;
        await this.manager?.close();
    }
}