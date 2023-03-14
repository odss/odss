import { assert } from 'chai';

import { Metadata, ICommandOptions } from '@odss/common';
import { MetadataTypes } from '../src/consts';
import { Command, Commands } from '../src/decorators';

describe('@Command()', () => {
    @Commands()
    class BasicCommands {
        @Command('install')
        installCommand() {}
        @Command('uninstall')
        uninstallCommand() {}
    }

    it('should create command metadata', () => {
        // const commands = new BasicCommands();
        const main = Metadata.target(BasicCommands).get(MetadataTypes.SHELL_COMMANDS);
        assert.deepEqual(main, {
            prefix: '',
        });
        const meta1 = Metadata.target(BasicCommands.prototype, 'installCommand').get(
            MetadataTypes.SHELL_COMMANDS_HANDLER
        );

        assert.deepEqual(
            {
                id: 'install',
            },
            meta1
        );

        const meta2 = Metadata.target(BasicCommands.prototype, 'uninstallCommand').get(
            MetadataTypes.SHELL_COMMANDS_HANDLER
        );

        assert.deepEqual(
            {
                id: 'uninstall',
            },
            meta2
        );
    });
    it('should scan basic command instance', () => {
        const meta = Metadata.scan(new BasicCommands(), null, (name, p) =>
            Metadata.target(p, name).get(MetadataTypes.SHELL_COMMANDS_HANDLER)
        );
        assert.deepEqual([{ id: 'install' }, { id: 'uninstall' }], meta);
    });
    it('should scan basic command instance by key', () => {
        const instance = new BasicCommands();
        const meta = Metadata.scanByKey<BasicCommands, ICommandOptions>(
            instance,
            null,
            MetadataTypes.SHELL_COMMANDS_HANDLER
        );
        assert.equal(2, meta.length);
        assert.deepEqual(
            [
                {
                    metadata: {
                        id: 'install',
                    },
                    handler: instance.installCommand,
                    name: 'installCommand',
                },
                {
                    metadata: {
                        id: 'uninstall',
                    },
                    handler: instance.uninstallCommand,
                    name: 'uninstallCommand',
                },
            ],
            meta
        );
    });
});
