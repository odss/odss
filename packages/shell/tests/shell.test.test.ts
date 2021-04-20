
import { assert } from 'chai';

import { Shell } from '../src/shell';

describe('ShellService()', () => {
    let shell;

    beforeEach(() => {
        shell = new Shell();
    });
    afterEach(() => {
        shell = null;
    });

    it('should add command', () => {
        shell.addCommand({ name: 'foo'});
        assert.deepEqual(shell.getCommandsName(), ['foo']);
    });
    it('should remove command', () => {
        shell.addCommand({ name: 'foo'});
        shell.removeCommand({name: 'foo'});
        assert.deepEqual(shell.getCommandsName(), []);
    });
    it('should add command with alias', () => {
        shell.addCommand({ name: 'foo', alias: 'bar'});
        assert.deepEqual(shell.getCommandsName(), ['foo', 'bar']);
    });
    it('should add command with aliases', () => {
        shell.addCommand({ name: 'foo', alias: ['bar', 'bzz']});
        assert.deepEqual(shell.getCommandsName(), ['foo', 'bar', 'bzz']);
    });
    it('should add command with namespace', () => {
        shell.addCommand({ name: 'foo', namespace: 'ns'});
        assert.deepEqual(shell.getCommandsName(), ['ns:foo']);
    });
    it('should add command with namespace and alias', () => {
        shell.addCommand({ name: 'foo', namespace: 'ns', alias: 'bar'});
        assert.deepEqual(shell.getCommandsName(), ['ns:foo', 'ns:bar']);
    });
    it('should execute command', async () => {
        const events: string[][] = [];
        shell.addCommand({
            name: 'test',
            execute(args: string[]): string {
                events.push(args);
                return 'OK'
            }
        });
        const result = await shell.execute('test 1 2 --foo=bar');
        assert.deepEqual(result, 'OK');
        assert.deepEqual(events, [['1', '2', '--foo=bar']]);
    });

});