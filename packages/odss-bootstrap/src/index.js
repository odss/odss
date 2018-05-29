import { ready } from 'sjs-dom';
import { Framework } from 'odss-framework';

export async function boot(options = {}, runner=asyncRunner) {
    await ready();

    let framework = new Framework(options.properties);
    framework.start();
    let bundles = options.bundles || [];
    runner(framework, bundles)
    return framework;
}

export async function asyncRunner(framework, bundles) {
    await Promise.all(bundles.map(location =>
        framework.installBundle(location, true)
    ));
}

export async function syncRunner(framework, bundles){
    for(let bundle of bundles){
        await framework.installBundle(bundle, true);
    }
}