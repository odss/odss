import { promises as fs } from 'fs';
import * as Path from 'path';
import { spawn } from 'child_process';
import * as chokidar from 'chokidar';
import {
    IBundle,
    IBundleContext,
    BundleTracker,
    Bundles,
} from '@odss/common';

async function readJsonFile(filePath: string): any {
    const payload = await fs.readFile(filePath, {encoding: 'utf-8'});
    return JSON.parse(payload);
}

class Runner {
    private processing = false;
    private queue: string[] = [];

    add(path: string) {
        if (!this.queue.includes(path)) {
            this.queue.push(path);
            this.next();
        }
    }
    private async next() {
        if (!this.processing) {
            this.processing = true;
            while(this.queue.length) {
                const path = this.queue.pop();
                const cwd = await findRootPath(path);
                try {
                    console.log('compile', cwd);
                    const out = await this.aspawn('npm', ['--dev'], {cwd});
                    console.log(out);
                    process.kill(process.pid, 'SIGHUP');
                } catch(e) {
                    console.warn(e);
                }
            }

            this.processing = false;
        }
    }

    aspawn(command: string, args: string[], options: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const childProcess = spawn(command, args, options)
            const stdout: string[] = [];
            childProcess.stdout.on('data', buf => {
                stdout.push(buf.toString());
            });

            const stderr: string[] = [];
            childProcess.stderr.on('data', buf => {
                stderr.push(buf.toString());
            });

            childProcess.on('error', reject);
            childProcess.on('close', code => {
                if (code !== 0) {
                    reject(new Error('Child process failed\n' + stderr));
                    return;
                }
                resolve(stdout.join(''));
            });
        });
    }
}

export class ActiveBundleTracker extends BundleTracker {
    private watcher;
    private runner: Runner = new Runner();
    constructor(private ctx: IBundleContext) {
        super(ctx, Bundles.ACTIVE);
        const cwd = ctx.getProperty<string>('cwd');
        this.watcher = chokidar.watch(cwd);
    }
    async open() {
        await super.open();
        this.watcher.on('change', path => {
            console.log(`File ${path} has been changed`)
            this.runner.add(path);
        });
    }
    async close() {
        await super.close();
        await this.watcher.close();
    }
    async addingBundle(bundle: IBundle): Promise<void> {
        const { path } = bundle.module
        const sourcePath = await findSourceDir(path);
        if (sourcePath) {
            console.log(`Add to watch: ${sourcePath}`);
            this.watcher.add(sourcePath);
        }
    }
    // modifiedBundle(bundle: IBundle): void {}
    async removedBundle(bundle: IBundle): Promise<void> {
        const { path } = bundle.module
        const sourcePath = await findSourceDir(path);
        if (sourcePath) {
            console.log(`Remove from watch: ${sourcePath}`);
            this.watcher.unwatch(sourcePath);
        }
    }
}

async function findSourceDir(path) {
    const root = await findRootPath(path);
    const data = await readJsonFile(Path.join(root, 'package.json'));
    const hasBuidlCommand = !!data?.scripts?.build;
    if (!hasBuidlCommand) {
        console.log('Not found build script');
        return;
    }
    const sourcePath = data?.source;
    if (!sourcePath) {
        console.log('Not found source key in packages.json ')
        return;
    }
    return Path.join(root, Path.dirname(sourcePath));
}
async function findRootPath(filePath) {
    const parts = filePath.split(Path.sep);
    while(parts.length) {
        parts.pop();
        const root = parts.join(Path.sep);
        const packagesPath = Path.join(root, 'package.json');
        try {
            await fs.stat(packagesPath);
            return root;
        } catch(e) {
            console.log(e);
        }
    }
}
