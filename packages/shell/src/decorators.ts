import { ICommandOptions, Metadata } from '@odss/common';
import { MetadataTypes } from './consts';

export function Command(options: string | ICommandOptions) /*: MethodDecorator */ {
    if (typeof options === 'string') {
        options = {
            id: options,
        } as ICommandOptions;
    }
    return (target: any, key: string) => {
        Metadata.target(target, key).set(MetadataTypes.SHELL_COMMANDS_HANDLER, options);
    };
}
interface CommandsMetadata {
    prefix: string;
}

export function Commands(prefix = ''): ClassDecorator {
    return (target: any) => {
        Metadata.target(target).set<CommandsMetadata>(MetadataTypes.SHELL_COMMANDS, { prefix });
    };
}
