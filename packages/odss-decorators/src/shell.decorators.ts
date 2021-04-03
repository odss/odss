import { ICommandOptions, HandlerTypes, HandlersContext } from '@odss/common';

export function Command(options: string | ICommandOptions): MethodDecorator {
    if (typeof options === 'string') {
        options = {
            name: options,
        } as ICommandOptions;
    }
    return (target: any, key: string | symbol) => {
        HandlersContext
            .get(target.constructor)
            .setHandlerDefaults(HandlerTypes.SHELL_COMMAND, [])
            .push({key, options});
    };
}
