export class IShell {
    hasCommand(name) {}
        /**
         *
         * @param {Object|odss.api.Command} cmd
         */
    addCommand(cmd) {}
        /**
         *
         * @param {String|odss.api.Command} cmd Command or command name
         */
    removeCommand(cmd) {}
        /**
         * @return {Array} Return list of commands services
         */
    getCommands() {}

    /**
     * @return {Array} Return list of commands services name
     */
    getCommandsName() {}
        /**
         * @param {String} name Command name
         */
    getCommand(name) {}

    /**
     *
     * @param {String} name Command name
     * @return {String} Command usage
     */
    getCommandUsage(name) {}

    /**
     *
     * @param {String} name Command name
     * @return {String} Command description
     */
    getCommandDescription(name) {}

    /**
     *
     * @param {String} cmdLine
     * @param {Callback} out
     * @param {Callback} err
     */
    execute(cmdLine, out, err) {}

    /**
     * @param {String} cmdLine
     * @param {Function} callback
     */
    complete(cmdLine, callback) {}
}

export class ICommand {

    static extendProperty(command, params) {
        let param, name, type, require, value;
        for (let i = 0; i < COMMAND_PARAMS.length; i++) {
            param = COMMAND_PARAMS[i];
            name = param.name;
            type = param.type || 'string';
            require = param.require || false;
            if (name in params) {
                value = params[name];
                if (type && typeof params[name] !== type) {
                    throw new Error('letiable "' + name + '" should be "' + type + '"');
                }
                if (type === 'function') {
                    command[name] = params[name];
                    continue;
                }
                if (require && type === 'string' && !value) {
                    throw new Error('Empty letiable "' + name + '"');
                }
                Object.defineProperty(command, name, {
                    value: params[name],
                    enumerable: true
                });
            } else if (require) {
                throw new Error('letiable "' + name + '" is require in command definition');
            }
        }
    }
}

IShell.$namespace = 'odss.api/shell';
ICommand.$namespace = 'odss.api/shell';

let COMMAND_PARAMS = [{
    name: 'name',
    require: true,
    type: 'string'
}, {
    name: 'description',
    require: false
}, {
    name: 'man',
    require: false
}, {
    name: 'params',
    require: false,
    type: 'object'
}, {
    name: 'order',
    require: false,
    type: 'number'
}, {
    name: 'execute',
    require: true,
    type: 'function'
}, {
    name: 'complete',
    require: false,
    type: 'function'
}];
