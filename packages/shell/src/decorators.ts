import { ShellCommandsService, ICommandOptions, Metadata, getTokenType } from '@odss/common';
import { MetadataTypes } from './consts';

export function Command(options: string | ICommandOptions) /*: MethodDecorator */ {
    if (typeof options === 'string') {
        options = {
            name: options,
        } as ICommandOptions;
    }
    return (target: any, key: string) => {
        Metadata.target(target, key).set(MetadataTypes.SHELL_COMMANDS_HANDLER, options);
    };
}
interface CommandsMetadata {
    namespace: string;
}

export function Commands(namespace = 'default'): ClassDecorator {
    return (target: any) => {
        Metadata.target(target).set<CommandsMetadata>(MetadataTypes.SHELL_COMMAND, { namespace });
    };
}
