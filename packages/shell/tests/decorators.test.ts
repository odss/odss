import { assert } from 'chai';

import { Metadata, ICommandOptions } from '@odss/common';
import { MetadataTypes } from '../src/consts';
import { Command, Commands } from '../src/decorators';

describe('@Command()', () => {
    @Commands()
    class BasicCommands {
        @Command('install')
        installCommand() {

        }
        @Command('uninstall')
        uninstallCommand() {

        }
    }

    it('should create command metadata', () => {
        // const commands = new BasicCommands();
        const main = Metadata
            .target(BasicCommands)
            .get(MetadataTypes.SHELL_COMMAND);
        assert.deepEqual(main, {
            namespace: "default"
        });
        const meta1 = Metadata
            .target(BasicCommands.prototype, 'installCommand')
            .get(MetadataTypes.SHELL_COMMANDS_HANDLER);

        assert.deepEqual({
            name: 'install',
        }, meta1);

        const meta2 = Metadata
            .target(BasicCommands.prototype, 'uninstallCommand')
            .get(MetadataTypes.SHELL_COMMANDS_HANDLER);

        assert.deepEqual({
            name: 'uninstall',
        }, meta2);
    });
    it('should scan basic command instance', () => {

        const meta = Metadata.scan(
            new BasicCommands(), null, (name, p) =>
                Metadata
                    .target(p, name)
                    .get(MetadataTypes.SHELL_COMMANDS_HANDLER)
        );
        assert.deepEqual([{ name: 'install'}, {name: 'uninstall'}], meta);
    });
    it('should scan basic command instance by key', () => {
        const instance = new BasicCommands();
        const meta = Metadata.scanByKey<BasicCommands, ICommandOptions>(
            instance, null, MetadataTypes.SHELL_COMMANDS_HANDLER);
        assert.equal(2, meta.length);
        assert.deepEqual([{
            metadata: {
                name: "install",
            },
            handler: instance.installCommand,
            name: 'installCommand',
        }, {
            metadata: {
                name: "uninstall",
            },
            handler: instance.uninstallCommand,
            name: 'uninstallCommand',
        }], meta);

    });
});
