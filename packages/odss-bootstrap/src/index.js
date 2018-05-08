import { ready } from 'sjs-dom';
import { Framework } from 'odss-framework';


export async function boot(options = {}) {
    await ready();

    let framework = new Framework(options.properties);
    framework.start();
    let bundles = options.bundles || [];
    await Promise.all(bundles.map(location =>
        framework.installBundle(location, true)
    ));
    // for(let bundle of bundles){
    //     await framework.installBundle(bundle, true);
    // }
    return framework;
}
