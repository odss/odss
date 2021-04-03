import { assert } from 'chai';

import { HandlersContext, HandlerTypes } from '@odss/common';

import { Command } from '../src';

describe('@Command()', () => {
    it('should create command metadata', () => {

        class Commands {
            @Command('install')
            installCommand() {

            }
            @Command('uninstall')
            uninstallCommand() {

            }

        }
        const meta = HandlersContext.get(Commands).getHandler(HandlerTypes.SHELL_COMMAND);
        assert.deepEqual([{
            key: 'installCommand', options: {
                name: 'install',
            }
        },
        {
            key: 'uninstallCommand',
            options: {
                name: 'uninstall',
            }
        }
        ], meta);
    });
});
