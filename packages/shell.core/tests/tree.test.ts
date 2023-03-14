
import { assert } from 'chai';
import { CommandNode } from '../src/tree';


describe('new CommandsRegistry()', () => {
    function Command(id): [string[], any] {
        return [id.split('/'), { id, execute(){ return ''; } }];
    }

    it('should add command', () => {
        const root = new CommandNode('root')
        root.add(...Command('foo'));
        assert.deepEqual(root.keys(), ['foo']);
    });
    it('should add sub commands', () => {
        const root = new CommandNode('root')
        root.add(...Command('foo/bar'));
        root.add(...Command('foo/baz'));
        root.add(...Command('a/b/c'));
        assert.deepEqual(root.keys().sort(), ['a', 'foo']);
    });
    it('should remove commands', () => {
        const root = new CommandNode('root')
        root.add(...Command('foo'));
        root.remove(['foo'])
        assert.deepEqual(root.keys(), []);
    });
    it('should remove sub commands', () => {
        const root = new CommandNode('root')
        root.add(...Command('foo/bar'));
        root.remove('foo/bar'.split('/'));
        assert.deepEqual(root.keys(), []);
    });
    it('should find commands', () => {
        const root = new CommandNode('root')
        root.add(...Command('a/b/1'));
        root.add(...Command('a/b/2'));
        const node = root.find('a/b'.split('/'));
        assert.deepEqual(node.keys(), ['1', '2']);
    });
    it('should catch adding exist command', () => {
        const root = new CommandNode('root')
        root.add(...Command('foo/bar'));
        try {
            root.add(...Command('foo/bar'));
            assert.fail();
        } catch(err) {
            assert.instanceOf(err, Error);
            assert.equal(
                err.message,
                'Command: foo/bar is already registered'
            );
        }
    });
    it('should catch removing not exist command', () => {
        const root = new CommandNode('root')
        root.add(...Command('foo/bar'));
        try {
            root.remove(['test']);
            assert.fail();
        } catch(err) {
            assert.instanceOf(err, Error);
            assert.equal(
                err.message,
                'Command: test not exists'
            );
        }
    });
});