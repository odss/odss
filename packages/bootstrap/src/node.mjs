import { link, lstat, promises as fs } from 'fs';
import util from 'util';
import path from 'path';
import resolve from 'resolve';

import { getLogger } from '@stool/logging';
import { boot, syncRunner } from '@odss/core';
import { installPackage } from './packages.mjs';
import { ROOT, SHELL_BUNDLES } from './consts.mjs';

const presolve = util.promisify(resolve);

const logger = getLogger('odss.bootstrap.node');

const resolver = (cwd, paths, install) => ({
    loader: {
        async resolver(id) {
            for(const root of [cwd, ...paths]) {
                // console.debug(`Resolve: "${id}"`);
                try {
                    const path = await findPackageName(root, id);
                    logger.debug(`Find ${id} as path: "${path}"`);
                    return path;
                } catch(e) {}
            }
            if (install) {
                logger.debug(`Not found ${id}. Trying install it.`);
                const status = await installPackage([id], cwd);
                if (status) {
                    try {
                        return await findPackageName(cwd, id);
                    } catch(ex) {
                        console.log(ex);
                    }
                }
            }
            throw new TypeError(`Not found path: ${id}`);
        }
    }
});

export async function run(cwd, { bundles, properties: props, ...options }) {
    const {
        dependencies = {},
        properties = {},
        paths = []
    } = await findConfigFile(cwd);
    if (options.shell) {
        paths.push(ROOT);
        bundles.push(...SHELL_BUNDLES);
    }
    const config = {
        properties: {
            ...resolver(cwd, paths, options.npmInstall),
            ...properties,
            ...props
        },
        bundles: [...Object.keys(dependencies), ...bundles ],
    };
    return await boot(config, syncRunner);
}

const findPackageName = async (basedir, id) => presolve(id, {
    basedir,
    packageFilter,
    extensions: ['.mjs']
});


function packageFilter({...pkg}) {
    for (let name of ['module', 'esnext', 'main']) {
        if(pkg[name]) {
            pkg['main'] = pkg[name];
            break;
        }
    }
    return pkg;
};

const LOADERS = {
    'package.json' : readJson,
};

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath));
}

async function fileExists(filePath) {
    try {
        const stat = await fs.stat(filePath)
        if (stat.isFile()) {
            return true;
        }
    } catch(e) {

    }
    return false;
}

export async function findConfigFile(root) {
    for(const [file, loader] of Object.entries(LOADERS)) {
        const filePath = path.join(root, file);
        if (await fileExists(filePath)) {
            return await loader(filePath);
        }
    }
    throw Error(`Not found config file [${Object.keys(LOADERS).join(', ')}]`);
}
