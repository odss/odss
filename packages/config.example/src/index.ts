import { IBundleContext, ConfigManagedService, SERVICE_PID } from '@odss/common';

class PrinterService {
    private format = 'short';
    print() {
        console.log(`Printing...${this.format}`);
    }
    updated(props) {
        console.log(`PrinterService.updated(props)`, props);
        if (props['format']) {
            this.format = props['format'];
        }
    }
}

export class Activator {
    private timer: any;
    async start(ctx: IBundleContext) {
        const service = new PrinterService();
        ctx.registerService(ConfigManagedService, service, {
            [SERVICE_PID]: 'printer.service',
        });
        const next = () => {
            service.print();
            this.timer = setTimeout(next, 1000);
        };
        next();
    }
    async stop(ctx: IBundleContext) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}
