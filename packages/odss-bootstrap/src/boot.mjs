import { FrameworkFactory, Framework } from '@odss/core';

const DEFAULT_CONFIG = {
    properties: {},
    bundles: [],
};

export async function boot({ properties, bundles }, runner=syncRunner) {
    console.log({ properties, bundles});
    let framework = new FrameworkFactory().create(properties || {});
    await framework.start();
    await runner(framework, bundles || []);
    return framework;
}

export async function asyncRunner(framework, bundles) {
    await Promise.all(bundles.map(location =>
        framework.installBundle(location, true)
    ));
}

export async function syncRunner(framework, bundles) {
    for (let bundle of bundles) {
        await framework.installBundle(bundle, true);
    }
}
