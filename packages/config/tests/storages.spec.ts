import { assert } from 'chai';
import { LocalConfigStorage } from '../src/local-storage';
import { MemoryConfigStorage } from '../src/memory-storage';

describe('new LocalConfigStorage()', function() {
    before(function() {
        if (!globalThis.localStorage) {
            this.skip();
        }
    });
    beforeEach(() => {
        globalThis.localStorage.clear();
    });
    it('should store data', async () => {
        const storage = new LocalConfigStorage();
        assert.isFalse(await storage.exists('pid'));
        await storage.store('pid', { foo: 'bar'});
        assert.isTrue(await storage.exists('pid'));
        assert.isFalse(await storage.exists('test'));
    });
    it('should load stored pid',async () => {
        const storage = new LocalConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        assert.deepEqual(await storage.load('test2'), { foo2: 'bar2'});
    });
    it('should return stored pids',async () => {
        const storage = new LocalConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        assert.deepEqual(await storage.keys(), ['test1', 'test2']);
    });
    it('should return all dicts',async () => {
        const storage = new LocalConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        assert.deepEqual(await storage.loadAll(), [{foo1: 'bar1'}, {foo2: 'bar2'}]);
    });
    it('should remove stored data',async () => {
        const storage = new LocalConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        await storage.remove('test1');
        assert.deepEqual(await storage.keys(), ['test2']);
    });
});

describe('new MemoryConfigStorage()', function() {
    it('should store data', async () => {
        const storage = new MemoryConfigStorage();
        assert.isFalse(await storage.exists('pid'));
        await storage.store('pid', { foo: 'bar'});
        assert.isTrue(await storage.exists('pid'));
        assert.isFalse(await storage.exists('test'));
    });
    it('should load stored pid',async () => {
        const storage = new MemoryConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        assert.deepEqual(await storage.load('test2'), { foo2: 'bar2'});
    });
    it('should return stored pids',async () => {
        const storage = new MemoryConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        assert.deepEqual(await storage.keys(), ['test1', 'test2']);
    });
    it('should return all dicts',async () => {
        const storage = new MemoryConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        assert.deepEqual(await storage.loadAll(), [{foo1: 'bar1'}, {foo2: 'bar2'}]);
    });
    it('should remove stored data',async () => {
        const storage = new MemoryConfigStorage();
        await storage.store('test1', { foo1: 'bar1'});
        await storage.store('test2', { foo2: 'bar2'});
        await storage.remove('test1');
        assert.deepEqual(await storage.keys(), ['test2']);
    });
});