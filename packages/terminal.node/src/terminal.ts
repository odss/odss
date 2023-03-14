import * as readline from 'readline';
import { ICommandShell } from '@odss/common';

export class TerminalService {
    private shell?: ICommandShell;
    private rl?: readline.Interface;

    constructor() {}
    attach(shell: ICommandShell) {
        this.shell = shell;
    }
    detach() {
        this.shell = undefined;
    }
    open() {
        this.createInterface();
    }
    close() {
        if (this.rl) {
            this.rl.close();
            this.rl = undefined;
        }
        this.shell = undefined;
    }
    private async createInterface() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            completer: async (line: string, cb: (err: any, result: any) => void) => {
                try {
                    const hits = this.shell ? await this.shell.complete(line) : [];
                    cb(null, [hits, line]);
                } catch (ex) {
                    console.log({ ex });
                    // cb(e, []);
                }
            },
            prompt: 'odss:shell> ',
        });
        // this.rl.on('line', (line) => {
        //     console.log('Readline', line);
        // });
        // this.rl.on('pause', () => {
        //     console.log('Readline paused.');
        // });
        // this.rl.on('resume', () => {
        //     console.log('Readline resumed.');
        // });
        // this.rl.on('close', () => {
        //     console.log('Readline closed');
        // });

        this.rl.on('SIGINT', () => {
            if (this.shell) {
                this.shell.execute('exit');
            }
        });

        this.rl.prompt();

        for await (const line of this.rl) {
            // console.log(line);
            if (!line) {
                this.rl?.prompt();
                continue;
            }
            if (this.shell) {
                try {
                    const result = await this.shell.execute(line);
                    console.log(result);
                } catch (ex) {
                    console.log(ex);
                }
            } else {
                console.warn('Not found shell service.');
            }
            this.rl?.prompt();
        }
    }
}
