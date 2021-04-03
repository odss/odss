import { promises as fs } from 'fs';
import util from 'util';
import path from 'path';
import resolve from 'resolve';

import { boot, syncRunner } from './boot.mjs';

const resolvePromise = util.promisify(resolve);

export async function run(basedir, { bundles, properties, ...options }) {
    const { dependencies = {} } = await findConfigFile(basedir);
    const config = {
        properties,
        bundles: [...Object.keys(dependencies), ...bundles ],
    };
    config.properties.loader = {
        async resolver(id) {
            const location = await resolvePromise(id, {
                basedir,
                packageFilter,
                extensions: ['.mjs']
            });
            return location;
        }
    }
    return await boot(config, syncRunner);
}

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
