import { ready } from '@stool/dom';
import { Framework } from '@odss/framework';

export async function boot(options = {}, runner=asyncRunner) {
    let framework = new Framework(options.properties);

    await ready();

    await framework.start();

    let bundles = options.bundles || [];
    runner(framework, bundles);
    return framework;
}

export async function asyncRunner(framework, bundles) {
    await Promise.all(bundles.map(location =>
        framework.installBundle(location, true)
    ));
}

export async function syncRunner(framework, bundles){
    for (let bundle of bundles) {
        await framework.installBundle(bundle, true);
    }
}
