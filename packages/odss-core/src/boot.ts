import { FrameworkFactory, Framework } from './framework';

const DEFAULT_CONFIG = {
    properties: {},
    bundles: [],
};

export async function boot({ properties, bundles } = DEFAULT_CONFIG, runner = asyncRunner) {
    await ready();

    let framework = new FrameworkFactory().create(properties || {});
    await framework.start();

    await runner(framework, bundles || []);
    return framework;
}

export async function asyncRunner(framework: Framework, bundles: string[]): Promise<void> {
    await Promise.all(bundles.map(location => framework.installBundle(location, true)));
}

export async function syncRunner(framework: Framework, bundles: string[]): Promise<void> {
    for (let bundle of bundles) {
        await framework.installBundle(bundle, true);
    }
}

function ready(): Promise<void> {
    return new Promise<void>(resolve => {
        if (typeof document === 'undefined') {
            resolve();
            return;
        }
        if (document.readyState === 'complete') {
            resolve();
        } else {
            document.addEventListener('DOMContentLoaded', loaded, false);
            window.addEventListener('load', loaded, false);
        }
        function loaded() {
            document.removeEventListener('DOMContentLoaded', loaded, false);
            window.removeEventListener('load', loaded, false);
            resolve();
        }
    });
}
