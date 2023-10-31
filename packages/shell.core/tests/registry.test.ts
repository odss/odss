
import { assert } from 'chai';
import { CommandsRegistry } from '../src/registry';

describe('new CommandsRegistry()', () => {
    const Command = (props) => ({ ...props, execute(){ return ''; } });
    const testRegistry = () => {
        const registry = new CommandsRegistry();
        const cmd1 = Command({ id: 'a' });
        const cmd2 = Command({ id: 'b/d' });
        const cmd3 = Command({ id: 'b/e' });
        const cmd4 = Command({ id: 'c/f/g' });
        registry.addCommand(cmd1);
        registry.addCommand(cmd2);
        registry.addCommand(cmd3);
        registry.addCommand(cmd4);
        return registry;
    };
    it('should add command', () => {
        const registry = new CommandsRegistry();
        const cmd = Command({ id: 'foo' });
        registry.addCommand(cmd);
        assert.deepEqual([...registry.getNode().keys()], ['foo']);
    });
    it('should remove command', () => {
        const registry = new CommandsRegistry();
        const cmd = Command({ id: 'foo' });
        registry.addCommand(cmd);
        registry.removeCommand(cmd);
        assert.deepEqual(registry.getNode().keys(), []);
    });
    it('should find all sub commands', () => {
        const registry = testRegistry();

        const names1 = [...registry.getNode().keys()].sort();
        assert.deepEqual(names1, ['a', 'b', 'c']);

        const names2 = [...registry.getNode('b').keys()].sort();
        assert.deepEqual(names2, ['d','e']);

        const names3 = [...registry.getNode('c/f').keys()].sort();
        assert.deepEqual(names3, ['g']);

        const names4 = [...registry.getNode('c/f/').keys()].sort();
        assert.deepEqual(names4, ['g']);
    });

    it('should resolve command', async () => {
        const registry = testRegistry();

        const { command, args } = registry.resolve('a --test');
        assert.equal(command.id, 'a');
        assert.deepEqual(args, ['--test']);

    });
    it('should resolve sub command', async () => {
        const registry = testRegistry();
        const { command, args } = registry.resolve('b d args --test');
        assert.equal(command.id, 'b/d');
        assert.deepEqual(args, ['args', '--test']);
    });

    it('should resolve only strict command', async () => {
        const registry = testRegistry();
        const result = registry.resolve('b --test');
        assert.isUndefined(result);
    });
});