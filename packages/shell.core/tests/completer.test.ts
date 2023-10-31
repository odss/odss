
import { assert } from 'chai';
import { CommandsRegistry } from '../src/registry';
import { Completer } from '../src/completer';


describe('completer', () => {
    const Command = (props) => ({ ...props, execute(){ return ''; } });
    const testCompleter = () => {
        const registry = new CommandsRegistry();
        const cmd1 = Command({ id: 'cmd-one' });
        const cmd2 = Command({ id: 'cmd-two/foo' });
        const cmd3 = Command({ id: 'cmd-two/bar' });
        const cmd4 = Command({ id: 'cmd-two/baz' });
        const cmd5 = Command({ id: 'foo/bar/one' });
        const cmd6 = Command({ id: 'foo/bar/two' });
        registry.addCommand(cmd1);
        registry.addCommand(cmd2);
        registry.addCommand(cmd3);
        registry.addCommand(cmd4);
        registry.addCommand(cmd5);
        registry.addCommand(cmd6);
        return new Completer(registry);
    };
    it('should find all root commands', async () => {
        const completer = testCompleter();
        assert.deepEqual(await completer.resolve(''), ['cmd-one', 'cmd-two', 'foo']);
    });
    it('should find command (fuzz)', async () => {
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
        assert.deepEqual(await completer.resolve('cmd-two bar '), []);
        assert.deepEqual(await completer.resolve('cmd-two bar a'), []);
    });
    it('should find deep sub commands', async () => {
        const completer = testCompleter();
        assert.deepEqual(await completer.resolve('f'), ['foo']);
        assert.deepEqual(await completer.resolve('fo '), ['foo']);
        assert.deepEqual(await completer.resolve('foo'), ['bar']);
        assert.deepEqual(await completer.resolve('foo b'), ['bar']);
        assert.deepEqual(await completer.resolve('foo ba'), ['bar']);
        assert.deepEqual(await completer.resolve('foo bar'), ['one', 'two']);
        assert.deepEqual(await completer.resolve('foo bar t'), ['two']);
        assert.deepEqual(await completer.resolve('foo bar tw'), ['two']);
        assert.deepEqual(await completer.resolve('foo bar two'), []);
        assert.deepEqual(await completer.resolve('foo bar two a'), []);
        assert.deepEqual(await completer.resolve('foo bar o'), ['one']);
        assert.deepEqual(await completer.resolve('foo bar on'), ['one']);
        assert.deepEqual(await completer.resolve('foo bar one'), []);
        assert.deepEqual(await completer.resolve('foo bar one a'), []);
    });
    it('should resolve empty result', async () => {
        const completer = testCompleter();
        assert.deepEqual(await completer.resolve('a'), []);
        assert.deepEqual(await completer.resolve('a b'), []);
    });
});