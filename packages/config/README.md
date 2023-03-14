ODSS :: Config
===


The Config allows to update the configuration of managed services.

It is a loose interpretation of [OSGI Config Admin](https://docs.osgi.org/specification/osgi.cmpn/7.0.0/service.cm.html)

## Installation

```bash
npm i @odss/config
```

## Using

```ts
import { SERVICE_PID, IConfigManaged, ConfigManagedService} from '@odss/common';

class ConsoleService implements IConfigManaged {

    public updated(properties: Properties): void {
        if (properties === null) {
            // configuration has been deleted
        } else {
            // apply configuration 
            // { name: 'value' }
        }
    }
}

export class Activator {
    start(ctx: IBundleContext) {
        const props = {
            [SERVICE_PID]: 'console', // config identifier 
        };
        const service = new ConsoleService();
        ctx.registerService(ConfigManagedService, service, props);
    }
}
```

```ts
const config = admin.getConfig('console');

// set some values
await config.update({ name: 'value' });

// or remove then
await config.remove();
```

## Commands
```bash
cm list                # show list of config
cm get pid             # show details of specified config
cm set pid name=value  # set config value
cm factory fid         # create factory config
cm del pid             # remove config 