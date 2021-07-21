
import { spawn } from 'child_process';

export async function installPackage(modules, cwd) {
    const args = ['install', '--json', '--no-save', '--production', ...modules];
    const env = {};
    for (let key in process.env) {
        if (!key.startsWith('npm_') && key !== 'INIT_CWD' && key !== 'NODE_ENV') {
            env[key] = process.env[key];
        }
    }
    try {
        const output = await aspawn('npm', args, {cwd});
        const response = JSON.parse(output);
        const { added } = response;
        if (added) {
            console.log(`Installed ${added} packages by npm: ${modules.join(', ')}`);
        }
        return true;
    } catch(e) {
        console.warn(e);
    }
    return false;
}

function aspawn(command, args, options) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, options)
        const stdout = [];
        childProcess.stdout.on('data', buf => {
            stdout.push(buf.toString().trim());
        });

        const stderr = [];
        childProcess.stderr.on('data', buf => {
            stderr.push(buf.toString().trim());
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