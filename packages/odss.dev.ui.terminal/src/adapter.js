import Event from './event';

export default class CommandAdapter{
    constructor(terminal, shell) {
        this.terminal = terminal;
        this.shell = shell;
        this.on = new Event();
    }
    execute(line) {
        var on = this.on;
        this.shell.execute(line, function(res) {
            on.trigger({
                type: 'success',
                value: res
            });
        }, function(err) {
            on.trigger({
                type: 'error',
                value: err
            });
        });
    }

    complete(line) {
        var on = this.on;
        this.shell.complete(line, function(input, options) {
            on.trigger({
                type: 'complete',
                input: input,
                output: options.join(' ')
            });
        });
    }
    close() {
        if (typeof this.terminal.close === 'function') {
            this.terminal.close();
        }
    }
}