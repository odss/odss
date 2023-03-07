import { IShell } from '@odss/common';
import LocalEchoController from './vendors/local-echo';
import { Terminal } from './vendors/xterm';
import { MainUI } from './ui';

export class TerminalService  {
    private shell?: IShell;
    private xterm: any;
    private controller: any;
    private ui: MainUI = new MainUI();
    private toDispose: (() => void)[] = [];

    constructor() {
    }
    attach(shell: IShell) {
        this.shell = shell;
        this.ui.activate();
    }
    detach() {
        this.toggle(false);
        this.ui.deactivate();
        this.shell = null;
    }
    start() {
        this.ui.start();
        this.xterm = new Terminal({
            fontSize: '20px',
        });
        this.controller = new LocalEchoController();
        this.xterm.loadAddon(this.controller);
        this.xterm.open(this.ui.getContainer());
        this.runCommandLoop();

        this.toDispose.push(
            this.controller.addAutocompleteHandler((index, tokens, args) => {
                return this.shell?.complete(tokens.join(' ')) || [];
            })
        );
        this.toDispose.push(
            this.ui.onToggle(status => this.toggle(status))
        )
        this.toDispose.push(() => {
            this.controller.abortRead();
            this.controller.dispose();
            this.xterm.dispose();
            this.ui.stop();
        });
    }
    stop() {
        for(const dispose of this.toDispose) {
            dispose();
        }
        this.shell = null;
        this.controller = null;
        this.xterm = null;
    }
    toggle(status) {
        if (status) {
            this.xterm.focus();
        }
    }

    private async runCommandLoop(){
        while(true) {
            let line = '';
            try {
                line = await this.controller.read('odss> ');
            } catch(err) {
                console.log(err);
                break;
            }
            try {
                const result = await this.shell?.execute(line);
                this.controller.println(result);
            } catch(err) {
                this.controller.println(err);
            }
        }
    }
}
