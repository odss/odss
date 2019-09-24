import Event from './event';

export default class CommandAdapter{
    constructor(terminal, shell) {
        this.terminal = terminal;
        this.shell = shell;
        this.on = new Event();
    }
    async execute(line) {
        var on = this.on;
        try {
            const value = await this.shell.execute(line);
            on.trigger({
                type: 'success',
                value,
            });
        } catch(e) {
            on.trigger({
                type: 'error',
                value: e,
            });
        }
    }

    async complete(line) {
        var on = this.on;
        try {
            const value = await this.shell.complete(line);
            on.trigger({
                type: 'complete',
                input: '',
                output: value.join(' '),
            });
        } catch(e) {
            on.trigger({
                type: 'error',
                value: e,
            });
        };
    }
    close() {
        if (typeof this.terminal.close === 'function') {
            this.terminal.close();
        }
    }
}