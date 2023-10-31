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
import { ConfigManager } from './manager';
import { Supervisor } from './supervisor';

export class ConfigManagedTracker extends ServiceTracker {
    constructor(ctx: IBundleContext, private manager: ConfigManager) {
        super(ctx, ConfigManagedService);
    }

    async addingService(service: IConfigManaged, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        if (pid) {
            await this.manager.addService(pid, service);
        } else {
            console.warn('Missing PID in registered ConfigManagedService', service);
        }
    }
    // async modifiedService(): Promise<void> {}

    async removedService(service: IConfigManaged, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        if (pid) {
            await this.manager.removeService(pid, service);
        } else {
            console.warn('Missing PID in unregistered ConfigManagedService', service);
        }
    }
}
export class ConfigManagedFactoryTracker extends ServiceTracker {
    constructor(ctx: IBundleContext, private manager: ConfigManager) {
        super(ctx, ConfigManagedFactoryService);
    }

    async addingService(service: IConfigManagedFactory, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        if (pid) {
            await this.manager.addFactoryService(pid, service);
        } else {
            console.warn('Missing PID in registered ConfigManagedFactoryService', service);
        }
    }
    // async modifiedService(): Promise<void> {}

    async removedService(service: IConfigManagedFactory, ref: IServiceReference): Promise<void> {
        const pid = ref.getProperty<string>(SERVICE_PID);
        if (pid) {
            await this.manager.removeFactoryService(pid, service);
        } else {
            console.warn('Missing PID in unregistered ConfigManagedFactoryService', service);
        }
    }
}

export class ConfigStorageTracker extends ServiceTracker<IConfigStorage> {
    private storages: Map<IServiceReference, IConfigStorage> = new Map();
    private active: IServiceReference = null;

    constructor(ctx: IBundleContext, private supervisor: Supervisor) {
        super(ctx, ConfigStorageService);
    }
    async addingService(service: IConfigStorage, reference: IServiceReference): Promise<void> {
        this.storages.set(reference, service);
        await this.checkStorage();
    }
    async modifiedService(): Promise<void> {
        await this.checkStorage();
    }
    async removedService(
        service: ConfigStorageService,
        reference: IServiceReference
    ): Promise<void> {
        this.storages.delete(reference);
        await this.checkStorage();
    }
    async checkStorage() {
        const refs = [...this.storages.keys()];
        refs.sort((r1, r2) => r1.compare(r2));
        const first = refs[0];
        if (first !== this.active) {
            if (this.active) {
                this.active = null;
                await this.supervisor.unsetStorage();
            }

            if (first && this.storages.has(first)) {
                await this.supervisor.setStorage(this.storages.get(first));
                this.active = first;
            }
        }
    }
}
