import Completer from './completer';

export default class Shell{
    constructor() {
        this._commands = [];
        this._completer = new Completer(this);
    }
    hasCommand(name) {
        for (let i = 0; i < this._commands.length; i++) {
            if (this._commands[i].name === name) {
                return true;
            }
        }
        return false;
    }
    /**
     *
     * @param {Object|odss-api.Command} cmd
     */
    addCommand(cmd) {
        if (!cmd) {
            throw new Error('Expected argument: "cmd" in Shell::addCommand(): odss-api.Command | Object');
        }
        if (this.hasCommand(cmd.name)) {
            throw new Error('Command(name= ' + cmd.name + ') is already registered');
        }
        this._commands.push(cmd);
    }
    /**
     *
     * @param {String|odss-api.Command} cmd Command or command name
     */
    removeCommand(cmd) {
        let msg = 'Expected argument: "cmd" in Shell::removeCommand(): odss-api.Command | String | Object';
        if (!cmd) {
            throw new Error(msg);
        }
        if (cmd instanceof ICommand || typeof cmd.name === 'string') {
            cmd = cmd.name;
        }
        if (typeof cmd !== 'string') {
            throw new Error(msg);
        }
        for (let i = 0; this._commands.length; i++) {
            if (this._commands[i].name === cmd) {
                this._commands.splice(i, 1);
                return true;
            }
        }
        throw new Error('Not found command: ' + cmd);
    }
    /**
     * @return {Array} Return list of commands services
     */
    getCommands() {
        return this._commands.concat();
    }

    /**
     * @return {Array} Return list of commands services name
     */
    getCommandsName() {
        let buff = [];
        for (let i = 0, j = this._commands.length; i < j; i++) {
            buff.push(this._commands[i].name);
        }
        return buff;
    }

    /**
     * @param {String} name Command name
     */
    getCommand(name) {
        for (let i = 0, j = this._commands.length; i < j; i++) {
            let command = this._commands[i];
            if (command.name === name) {
                return command;
            }
        }
        return null;
    }

    /**
     *
     * @param {String} name Command name
     * @return {String} Command usage
     */
    getCommandUsage(name) {
        let command = this.getCommand(name);
        if (command) {
            return command.man;
        }
        return '';
    }

    /**
     *
     * @param {String} name Command name
     * @return {String} Command description
     */
    getCommandDescription(name) {
        let command = this.getCommand(name);
        if (command) {
            return command.description;
        }
        return '';
    }

    /**
     *
     * @param {String} cmdLine
     * @param {Callback} out
     * @param {Callback} err
     */
    execute(cmdLine, out, err) {
        let args = cmdLine.split(' ');
        let cmdName = args.shift();
        if (cmdName) {
            let command = this.getCommand(cmdName);
            if (command) {
                try {
                    command.execute(args, out, err);
                } catch (e) {
                    err(e);
                }
            } else {
                err(`${cmdName}: command not found`);
            }
        } else {
            out('');
        }
    }
    complete(cmdLine, callback) {
        this._completer.complete(cmdLine, callback);
    }
}
