import { SERVICE_FACTORY_PID, SERVICE_PID } from '@odss/common';
import { assert } from 'chai';
import { spy, stub } from 'sinon';
import { ConfigAdmin } from '../src/admin';
import { ConfigManager } from '../src/manager';
import { MemoryConfigStorage } from '../src/memory-storage';

describe('new ConfigManager()', function () {
    it('should load all configs on start from empty storage', async () => {
        const storage = new MemoryConfigStorage();
        const spyStorage = spy(storage);
        const manager = new ConfigManager(spyStorage);
        await manager.open();

        assert.equal(spyStorage.keys.callCount, 1);

        await manager.close();
    });
    it('should load all config on start', async () => {
        const storage = new MemoryConfigStorage();
        await storage.store('pid1', { foo1: 'bar1', [SERVICE_PID]: 'pid1' });
        await storage.store('pid2', { foo2: 'bar2', [SERVICE_PID]: 'pid2' });
        const spyStorage = spy(storage);
        const manager = new ConfigManager(spyStorage);

        await manager.open();

        assert.equal(spyStorage.keys.callCount, 1);
        assert.equal(spyStorage.load.callCount, 2);
        assert.deepEqual(spyStorage.load.args, [['pid1'], ['pid2']]);

        await manager.close();
    });
    describe('ConfigManagedService', () => {
        it('should not notify service for empty storage', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const serivce = spy({ updated() {} });
            await manager.addService('pid1', serivce);

            assert.equal(serivce.updated.callCount, 0);
        });

        it('should not notify service on register with new config', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            await admin.getConfig('pid1');

            const serivce = spy({ updated() {} });
            await manager.addService('pid1', serivce);

            assert.equal(serivce.updated.callCount, 0);
        });

        it('should notify service after register', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const config = await admin.getConfig('pid1');
            await config.update({ name: 'test' });

            const serivce = spy({ updated() {} });
            await manager.addService('pid1', serivce);

            assert.equal(serivce.updated.callCount, 1);
            assert.deepEqual(serivce.updated.firstCall.args, [
                {
                    name: 'test',
                },
            ]);
        });

        it('should notify service after unregister', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const config = await admin.getConfig('pid1');

            const serivce = spy({ updated() {} });
            await manager.addService('pid1', serivce);
            await manager.removeService('pid1', serivce);

            await config.update({ name: 'test' });

            assert.equal(serivce.updated.callCount, 0);
        });

        it('should notify service after config update', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const serivce = spy({ updated() {} });
            await manager.addService('pid1', serivce);
            assert.equal(serivce.updated.callCount, 0);

            const config = await admin.getConfig('pid1');

            assert.equal(serivce.updated.callCount, 0);

            await config.update({ name: 'test' });

            assert.equal(serivce.updated.callCount, 1);
            assert.deepEqual(serivce.updated.firstCall.args, [
                {
                    name: 'test',
                },
            ]);
        });

        it('should notify service after config remove', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);

            const serivce = spy({ updated() {} });
            await manager.addService('pid1', serivce);

            const config = await admin.getConfig('pid1');
            await config.remove();

            assert.equal(serivce.updated.callCount, 0);
        });

        it('should only register one unique service', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());

            const serivce = spy({ updated() {} });
            await manager.addService('pid1', serivce);

            try {
                await manager.addService('pid1', serivce);
                assert.fail();
            } catch (err) {
                assert.instanceOf(err, Error);
                assert.equal(err.message, 'ConfigManagedService with PID(pid1) already registered');
            }
        });
    });

    describe('ConfigManagedFactoryService', () => {
        it('should not notify service for empty storage', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);

            assert.equal(serivce.updated.callCount, 0);
        });

        it('should not notify service on register with new config', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);

            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);

            await admin.createFactoryConfig('fid1', 'pid1');

            assert.equal(serivce.updated.callCount, 0);
        });

        it('should notify service after register', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const config = await admin.createFactoryConfig('fid1', 'pid1');
            await config.update({ name: 'test' });

            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);

            assert.equal(serivce.updated.callCount, 1);
            assert.deepEqual(serivce.updated.firstCall.args, [
                'fid1:pid1',
                {
                    name: 'test',
                },
            ]);
        });

        it('should notify service after unregister', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const config = await admin.createFactoryConfig('fid1');

            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);
            await manager.removeFactoryService('fid1', serivce);

            await config.update({ name: 'test' });

            assert.equal(serivce.updated.callCount, 0);
        });

        it('should notify service after config update', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);

            assert.equal(serivce.updated.callCount, 0);

            const config = await admin.createFactoryConfig('fid1', 'pid1');

            assert.equal(serivce.updated.callCount, 0);

            await config.update({ name: 'test' });

            assert.equal(serivce.updated.callCount, 1);
            assert.deepEqual(serivce.updated.firstCall.args, [
                'fid1:pid1',
                {
                    name: 'test',
                },
            ]);
        });

        it('should notify service after configs update', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);

            assert.equal(serivce.updated.callCount, 0);

            const config1 = await admin.createFactoryConfig('fid1', 'pid1');
            const config2 = await admin.createFactoryConfig('fid1', 'pid2');

            assert.equal(serivce.updated.callCount, 0);

            await config1.update({ name: 'test1' });
            assert.equal(serivce.updated.callCount, 1);
            assert.deepEqual(serivce.updated.firstCall.args, [
                'fid1:pid1',
                {
                    name: 'test1',
                },
            ]);

            await config2.update({ name: 'test2' });
            assert.equal(serivce.updated.callCount, 2);
            assert.deepEqual(serivce.updated.secondCall.args, [
                'fid1:pid2',
                {
                    name: 'test2',
                },
            ]);
        });

        it('should not notify service for removed config', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);

            const config = await admin.createFactoryConfig('fid1', 'pid1');
            await config.update({}); // not new
            debugger;
            await config.remove();

            assert.equal(serivce.updated.callCount, 1);
            assert.equal(serivce.deleted.callCount, 1);
            assert.deepEqual(serivce.deleted.firstCall.args, ['fid1:pid1']);
        });

        it('should not notify service for new removed config', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());
            const admin = new ConfigAdmin(manager);
            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('fid1', serivce);

            const config = await admin.createFactoryConfig('fid1', 'pid1');
            await config.remove();

            assert.equal(serivce.updated.callCount, 0);
            assert.equal(serivce.deleted.callCount, 0);
        });

        it('should only register one unique service', async () => {
            const manager = new ConfigManager(new MemoryConfigStorage());

            const serivce = spy({ updated() {}, deleted() {} });
            await manager.addFactoryService('pid1', serivce);

            try {
                await manager.addFactoryService('pid1', serivce);
                assert.fail();
            } catch (err) {
                assert.instanceOf(err, Error);
                assert.equal(
                    err.message,
                    'ConfigManagedFactoryService with FID(pid1) already registered'
                );
            }
        });
    });
});
