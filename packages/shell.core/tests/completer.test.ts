
import { assert } from 'chai';
import { CommandsRegistry } from '../src/registry';
import { Completer } from '../src/completer';


describe('new CommandsRegistry()', () => {
    const Command = (props) => ({ ...props, execute(){ return ''; } });
    const testCompleter = () => {
        const registry = new CommandsRegistry();
        const cmd1 = Command({ id: 'cmd-one' });
        const cmd2 = Command({ id: 'cmd-two/foo' });
        const cmd3 = Command({ id: 'cmd-two/bar' });
        const cmd4 = Command({ id: 'cmd-two/baz' });
        const cmd5 = Command({ id: 'foo/bar/baz' });
        registry.addCommand(cmd1);
        registry.addCommand(cmd2);
        registry.addCommand(cmd3);
        registry.addCommand(cmd4);
        registry.addCommand(cmd5);
        return new Completer(registry);
    };
    it('should find all root commands', async () => {
        const completer = testCompleter();
        assert.deepEqual(await completer.resolve(''), ['cmd-one', 'cmd-two', 'foo']);
    });
    it('should find commands (fuzz)', async () => {
        const completer = testCompleter();
        assert.deepEqual(await completer.resolve('c'), ['cmd-one', 'cmd-two']);
        assert.deepEqual(await completer.resolve('cm'), ['cmd-one', 'cmd-two']);
        assert.deepEqual(await completer.resolve('cmd'), ['cmd-one', 'cmd-two']);
        assert.deepEqual(await completer.resolve('cmd-'), ['cmd-one', 'cmd-two']);
        assert.deepEqual(await completer.resolve('cmd-o'), ['cmd-one']);
        assert.deepEqual(await completer.resolve('cmd-on'), ['cmd-one']);
        assert.deepEqual(await completer.resolve('cmd-one'), []);
    });
    it('should find sub commands', async () => {
        const completer = testCompleter();
        assert.deepEqual(await completer.resolve('cmd-two'), ['foo', 'bar', 'baz']);
        assert.deepEqual(await completer.resolve('cmd-two '), ['foo', 'bar', 'baz']);
        assert.deepEqual(await completer.resolve('cmd-two b'), ['bar', 'baz']);
        assert.deepEqual(await completer.resolve('cmd-two ba'), ['bar', 'baz']);
        assert.deepEqual(await completer.resolve('cmd-two bar'), []);
    });
    it('should resolve empty result', async () => {
        const completer = testCompleter();
        assert.deepEqual(await completer.resolve('a'), []);
        assert.deepEqual(await completer.resolve('a b'), []);
    });
});