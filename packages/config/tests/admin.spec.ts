import { SERVICE_FACTORY_PID, SERVICE_PID } from '@odss/common';
import { assert } from 'chai';
import { spy } from 'sinon';
import { ConfigAdmin } from '../src/admin';
import { ConfigManager } from '../src/manager';
import { MemoryConfigStorage } from '../src/memory-storage';

describe('new ConfigAdmin()', function() {
    const adminFactory = () => {
        const storage = new MemoryConfigStorage();
        const admin = new ConfigAdmin(new ConfigManager(storage));
        return {
            storage,
            admin,
        };
    }
    it('should create new config', async () => {
        const storage = new MemoryConfigStorage();
        const spyStorage = spy(storage);
        const admin = new ConfigAdmin(new ConfigManager(spyStorage));

        const config = await admin.getConfig('pid');
        const config2 = await admin.getConfig('pid');

        assert.isTrue(config === config2);
        assert.equal(config.getPid(), 'pid');
        assert.equal(config.getFactoryPid(), '');
        assert.deepEqual(config.getProperties(), {
            [SERVICE_PID]: 'pid',
        });

        assert.deepEqual(await storage.keys(), ['pid']);
        assert.deepEqual(await storage.load('pid'), {
            [SERVICE_PID]: 'pid'
        });
        assert.equal(spyStorage.store.callCount, 1);
        assert.deepEqual(spyStorage.store.firstCall.args, ['pid', {[SERVICE_PID]: 'pid'}]);
    });
    it('should load config from storage', async () => {
        const storage = new MemoryConfigStorage();
        await storage.store('pid', {
            [SERVICE_PID]: 'pid',
            foo: 'bar',
        });
        const spyStorage = spy(storage);
        const admin = new ConfigAdmin(new ConfigManager(spyStorage));

        const config = await admin.getConfig('pid');

        assert.equal(config.getPid(), 'pid');
        assert.equal(config.getFactoryPid(), '');
        assert.deepEqual(config.getProperties(), {
            [SERVICE_PID]: 'pid',
            foo: 'bar'
        });
        assert.equal(spyStorage.store.callCount, 0);
    });
    it('should catch incorrect pid loaded from storage', async () => {
        const storage = new MemoryConfigStorage();
        await storage.store('pid', {
            [SERVICE_PID]: 'incorrect-pid',
            foo: 'bar',
        });
        const admin = new ConfigAdmin(new ConfigManager(storage));

        try {
            await admin.getConfig('pid');
            assert.fail();
        } catch(err) {
            assert.instanceOf(err, Error);
            assert.equal(err.message, 'Loaded PID(incorrect-pid) doesn\'t match requested PID(pid)')
        }
    });
    it('should update config from storage', async () => {
        const storage = new MemoryConfigStorage();
        const admin = new ConfigAdmin(new ConfigManager(storage));
        const config = await admin.getConfig('pid');
        await storage.store('pid', { ...config.getProperties(), foo: 'bar' });

        await config.reload();

        const props = config.getProperties();
        assert.deepEqual(props, {
            [SERVICE_PID]: 'pid',
            foo: 'bar',
        });
    });
    it('should update config', async () => {
        const storage = new MemoryConfigStorage();
        const admin = new ConfigAdmin(new ConfigManager(storage));
        const config = await admin.getConfig('pid');
        await storage.store('pid', { ...config.getProperties(), foo: 'bar' });

        await config.update({
            [SERVICE_PID]: 'other-pid', // should be omited and replaced by correct one
            foo: 'other-bar'
        });


        const props = config.getProperties();
        assert.deepEqual(props, {
            [SERVICE_PID]: 'pid',
            foo: 'other-bar',
        });
        assert.deepEqual(await storage.load('pid'), { '$service.pid$': 'pid', foo: 'other-bar' });
    });
    it('should remove config', async () => {
        const storage = new MemoryConfigStorage();
        const admin = new ConfigAdmin(new ConfigManager(storage));
        const config = await admin.getConfig('pid');

        await config.remove();

        assert.isFalse(await storage.exists('pid'));
    });
    it ('should create factory config', async () => {
        const storage = new MemoryConfigStorage();
        const admin = new ConfigAdmin(new ConfigManager(storage));
        const config = await admin.createFactoryConfig('factory-pid', 'pid');

        assert.equal(config.getPid(), 'factory-pid:pid');
        assert.equal(config.getFactoryPid(), 'factory-pid');
        assert.deepEqual(config.getProperties(), {
            [SERVICE_PID]: 'factory-pid:pid',
            [SERVICE_FACTORY_PID]: 'factory-pid',
        });
    });
    it ('should create factory config', async () => {
        const storage = new MemoryConfigStorage();
        const admin = new ConfigAdmin(new ConfigManager(storage));
        const config = await admin.createFactoryConfig('factory-pid', 'pid');

        assert.deepEqual(await storage.keys(), []);

        await config.update({
            foo: 'bar'
        });

        assert.deepEqual(config.getProperties(), {
            [SERVICE_FACTORY_PID]: "factory-pid",
            [SERVICE_PID]: "factory-pid:pid",
            "foo": "bar"
        });
        assert.deepEqual(await storage.load('factory-pid:pid'), {
            [SERVICE_FACTORY_PID]: "factory-pid",
            [SERVICE_PID]: "factory-pid:pid",
            "foo": "bar"
        });
    });

    it ('should return list of configs', async () => {
        const storage = new MemoryConfigStorage();
        const admin = new ConfigAdmin(new ConfigManager(storage));
        const config1 = await admin.getConfig('pid1');
        const config2 = await admin.getConfig('pid2');
        const config3 = await admin.getConfig('pid3');

        const configs = await admin.listConfigs();
        assert.equal(configs.length, 3);
        assert.deepEqual(configs[0].getPid(), 'pid1');
        assert.deepEqual(configs[1].getPid(), 'pid2');
        assert.deepEqual(configs[2].getPid(), 'pid3');
    });

});