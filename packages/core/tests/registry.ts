import { assert } from 'chai';
import * as sinon from 'sinon';
import { OBJECTCLASS, SERVICE_RANKING, Events } from '@odss/common';
import Registry from '../src/registry';

describe('odss-framework.service', () => {
    let self: any = {};

    it('import', () => {
        assert.ok(typeof Registry === 'function', 'Registry');
    });

    beforeEach(() => {
        self.bundle = {
            id: 1,
        };
        self.sbundle = {
            id: 2,
        };
        self.events = {
            service: {
                _items: [],
                fire: function (event) {
                    this._items.forEach(function (callback) {
                        callback(event);
                    });
                },
                /* jshint unused:false */
                add: function (bundle, callback, filter) {
                    this._items.push(callback);
                    return true;
                },
            },
        };
        self.registry = new Registry(self.events);
    });
    afterEach(() => {
        self.bundle = null;
        self.events = null;
        self.registry = null;
    });

    it('register service and check registration', async () => {
        let reg1 = await self.registry.registerService(self.bundle, 'test', 'service');

        assert.notEqual(reg1, null);
        assert.equal(1, self.registry.size());
        assert.equal(1, self.registry.findBundleReferences(self.bundle).length);
        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);

        await self.registry.registerService(self.bundle, 'test', 'service');
        assert.equal(2, self.registry.size());
        assert.equal(2, self.registry.findBundleReferences(self.bundle).length);
        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
    });

    it('unregister service by registration object', async () => {
        let reg1 = await self.registry.registerService(self.bundle, 'test1', 'service');
        let reg2 = await self.registry.registerService(self.bundle, 'test2', 's2');

        assert.equal(2, self.registry.size());

        await reg1.unregister();
        assert.equal(1, self.registry.size());

        await reg2.unregister();
        assert.equal(0, self.registry.size());
    });

    it('unregister all bundle services', async () => {
        await self.registry.registerService(self.sbundle, 'test', 'service');
        await self.registry.registerService(self.bundle, 'test', 's2');

        assert.equal(2, self.registry.size());

        await self.registry.unregisterAll(self.bundle);
        assert.equal(1, self.registry.size());

        await self.registry.unregisterAll(self.sbundle);
        assert.equal(0, self.registry.size());
    });

    it('get service', async () => {
        let reg = await self.registry.registerService(self.bundle, 'test', 'service');
        self.registry.find(self.sbundle, reg.getReference());

        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
        assert.equal(1, self.registry.findBundleReferencesInUse(self.sbundle).length);
    });

    it('unget()', async () => {
        let reg1 = await self.registry.registerService(self.bundle, 'test', 'service');
        let reg2 = await self.registry.registerService(self.bundle, 'test', 'service');

        self.registry.find(self.sbundle, reg1.getReference());
        self.registry.find(self.sbundle, reg2.getReference());

        //incorrect bundle
        self.registry.unget(self.bundle, reg1.getReference());

        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
        assert.equal(2, self.registry.findBundleReferencesInUse(self.sbundle).length);

        //correct bundle
        self.registry.unget(self.sbundle, reg1.getReference());

        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
        assert.equal(1, self.registry.findBundleReferencesInUse(self.sbundle).length);

        self.registry.unget(self.sbundle, reg2.getReference());

        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
        assert.equal(0, self.registry.findBundleReferencesInUse(self.sbundle).length);
    });

    it('ungetAll()', async () => {
        let reg1 = await self.registry.registerService(self.bundle, 'test', 'service');
        let reg2 = await self.registry.registerService(self.bundle, 'test', 'service');

        const ref1 = reg1.getReference();
        const ref2 = reg2.getReference();

        self.registry.find(self.sbundle, ref1);
        self.registry.find(self.sbundle, ref2);

        //incorrect bundle
        self.registry.ungetAll(self.bundle);

        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
        assert.equal(2, self.registry.findBundleReferencesInUse(self.sbundle).length);

        //correct bundle
        self.registry.ungetAll(self.sbundle);

        assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
        assert.equal(0, self.registry.findBundleReferencesInUse(self.sbundle).length);
    });

    it('change properties', async () => {
        let reg = await self.registry.registerService(self.bundle, 'test', {
            key: 'value',
        });
        reg.setProperties({ key: 'test' });
        assert.equal('test', reg.getReference().getProperty('key'));
    });

    it('change properties event', async () => {
        let spy = sinon.spy();
        let reg = await self.registry.registerService(self.bundle, 'test', null, {
            key: 'value',
            foo: 'bar',
        });
        assert.equal(true, self.events.service.add(self.bundle, spy, '(*)'));

        reg.setProperties({ key: 'test' });
        reg.setProperties({ key: 'test' });

        assert.deepEqual(1, spy.callCount);
        const event = spy.args[0][0];
        assert.deepEqual(Events.MODIFIED, event.type);
        assert.deepEqual(event.properties.key, 'value'); // old properties
    });

    it('reference usingBundles()', async () => {
        let reg = await self.registry.registerService(self.bundle, 'test', 'service');

        const ref = reg.getReference();

        self.registry.find(self.bundle, ref);
        self.registry.find(self.sbundle, ref);

        assert.equal(2, ref.usingBundles().length);

        self.registry.ungetAll(self.bundle);

        assert.equal(1, ref.usingBundles().length);

        self.registry.ungetAll(self.sbundle);

        assert.equal(0, ref.usingBundles().length);
    });

    it('service default order', async () => {
        let reg1 = await self.registry.registerService(self.bundle, 'spec', 'service1');
        let reg2 = await self.registry.registerService(self.bundle, 'spec', 'service2');

        const refs = self.registry.findReferences('spec');
        assert.equal(2, refs.length);

        const service1 = self.registry.find(self.bundle, refs[0]);
        assert.equal('service1', service1);
    });

    it('service custom order', async () => {
        let reg1 = await self.registry.registerService(self.bundle, 'spec', 'service1', {
            [SERVICE_RANKING]: 20,
        });
        let reg2 = await self.registry.registerService(self.bundle, 'spec', 'service2', {
            [SERVICE_RANKING]: 10,
        });

        const refs = self.registry.findReferences('spec');
        assert.equal(2, refs.length);
        const service1 = self.registry.find(self.bundle, refs[0]);
        assert.equal('service2', service1);
    });
});
