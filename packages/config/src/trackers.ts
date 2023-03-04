import {
    IBundleContext,
    ServiceTracker,
    ConfigManagedService,
    ConfigManagedFactoryService,
    ConfigStorageService,
    IConfigManaged,
    IServiceReference,
    SERVICE_PID,
    IConfigManagedFactory,
    IConfigStorage,
} from '@odss/common';
import { ConfigAdmin } from './admin';

export class ConfigManagedTracker extends ServiceTracker {
    constructor(ctx: IBundleContext, private admin: ConfigAdmin) {
        super(ctx, ConfigManagedService);
    }

    async addingService(service: IConfigManaged, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        await this.admin.addService(pid, service);
    }
    async modifiedService(): Promise<void> {}

    async removedService(service: IConfigManaged, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        await this.admin.removeService(pid, service);
    }
}
export class ConfigManagedFactoryTracker extends ServiceTracker {
    constructor(ctx: IBundleContext, private admin: ConfigAdmin) {
        super(ctx, ConfigManagedFactoryService);
    }

    async addingService(service: IConfigManagedFactory, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        await this.admin.addFactoryService(pid, service);
    }
    async modifiedService(): Promise<void> {}

    async removedService(service: IConfigManagedFactory, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        await this.admin.removeFactoryService(pid, service);
    }
}
export class ConfigStorageTracker extends ServiceTracker {
    constructor(ctx: IBundleContext, private admin: ConfigAdmin) {
        super(ctx, ConfigStorageService);
    }

    async addingService(service: IConfigStorage): Promise<void> {
        await this.admin.addStorage(service);
    }
    async modifiedService(): Promise<void> {}

    async removedService(service: ConfigStorageService, ref: IServiceReference): Promise<void> {
        await this.admin.removeStorage(service);
    }
}