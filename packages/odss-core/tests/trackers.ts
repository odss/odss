import { assert } from 'chai';
import * as sinon from 'sinon';
import { OBJECTCLASS, Bundles, ServiceTracker, BundleTracker } from '@odss/common';

import tests from './core';

describe('odss.tracker.getService() Tracker', () => {
    const scope: any = {};

    beforeEach(async () => {
        scope.factory = await tests.factory();
        scope.bundle = await scope.factory.bundle('service');
        await scope.bundle.start();
        scope.ctx = scope.bundle.context;
    });
    afterEach(() => {
        delete scope.factory;
        delete scope.bundle;
        delete scope.ctx;
    });

    it('init tracker', () => {
        let bundle = scope.bundle;
        assert.throws(() => {
            new ServiceTracker(bundle.context, '');
        }, 'Empty name');
    });
    it('register/unregister service', () => {
        let counter = 0;
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker', {
            addingService() {
                counter |= 1;
            },
            modifiedService() {},
            removedService() {
                counter |= 2;
            },
        });
        tracker.open();
        let reg = scope.ctx.registerService('test.tracker', 'test');

        reg.unregister();

        assert.equal(counter & 1, 1, 'Not fire ServiceTracker.addingService(ref)');
        assert.equal(counter & 2, 2, 'Not fire ServiceTracker.removedService(ref)');
    });
    it('tracker properties', () => {
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker');
        assert.equal(tracker.size(), 0, 'Tracker size should assert.equal 0');
        assert.equal(
            tracker.getReferences().length,
            0,
            'Tracker references should return empty array'
        );
        assert.equal(tracker.getReference(), null, 'Tracker reference should assert.equal null');
        assert.equal(tracker.getServices().length, 0, 'Tracker services should return empty array');
        assert.equal(tracker.getService(), null, 'Tracker services should return empty array');

        tracker.open();

        let reg = scope.ctx.registerService('test.tracker', 'test');

        assert.equal(tracker.size(), 1, 'Tracker size should assert.equal 0');
        assert.equal(
            tracker.getReferences().length,
            1,
            'Tracker references should return not empty array'
        );
        assert.equal(tracker.getService(), 'test', 'Tracker services should return: test');
        assert.deepEqual(
            tracker.getServices(),
            ['test'],
            'Tracker services should return array: [test]'
        );

        reg.unregister();

        assert.equal(tracker.size(), 0, 'Tracker size should assert.equal 0');
        assert.equal(
            tracker.getReferences().length,
            0,
            'Tracker references should return not empty array'
        );
        assert.deepEqual(tracker.getServices(), [], 'Tracker services should return array: [test]');
        assert.equal(tracker.getService(), null, 'Tracker services should return: test');

        reg = scope.ctx.registerService('test.tracker', 'test');

        assert.equal(tracker.size(), 1, 'Tracker size should assert.equal 0');
        assert.equal(
            tracker.getReferences().length,
            1,
            'Tracker references should return not empty array'
        );
        assert.equal(tracker.getService(), 'test', 'Tracker services should return: test');
        assert.deepEqual(
            tracker.getServices(),
            ['test'],
            'Tracker services should return array: [test]'
        );

        tracker.close();

        assert.equal(tracker.size(), 0, 'Tracker size should assert.equal 0');
        assert.equal(
            tracker.getReferences().length,
            0,
            'Tracker references should return not empty array'
        );
        assert.equal(tracker.getService(), null, 'Tracker services should return: test');
        assert.deepEqual(tracker.getServices(), [], 'Tracker services should return array: [test]');
    });

    it('stop tracker', () => {
        let counter = 0;
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker', {
            addingService() {
                counter |= 1;
            },
            modifiedService() {},
            removedService() {
                counter |= 2;
            },
        });
        tracker.open();
        scope.ctx.registerService('test.tracker', 'test1');
        assert.equal(counter, 1, 'Tracker should run addingService listener methods');
        tracker.close();
        scope.ctx.registerService('test.tracker', 'test2');
        assert.equal(counter, 3);
    });

    it('start tracker after register service', () => {
        scope.ctx.registerService('test.tracker', 'test');
        let counter = 0;
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker', {
            addingService: function (/* reference */) {
                counter++;
            },
            modifiedService() {},
            removedService() {},
        });

        tracker.open();
        assert.equal(counter, 1, 'Should find one register service');

        scope.ctx.registerService('test.tracker', 'test');
        assert.equal(counter, 2, 'Should find second register serivce');
    });

    it('ServiceTracker::reference', () => {
        scope.ctx.registerService('test.tracker', 'test1');
        scope.ctx.registerService('test.tracker', 'test2');

        let tracker = new ServiceTracker(scope.ctx, 'test.tracker').open();
        assert.equal(tracker.size(), 2, 'Found 2 services');
        let ref = tracker.getReference();
        assert.equal(ref.getProperty(OBJECTCLASS), 'test.tracker');
    });

    it('ServiceTracker::getServiceReferences()', () => {
        scope.ctx.registerService('test.tracker', 'test1');
        scope.ctx.registerService('test.tracker', 'test2');

        let tracker = new ServiceTracker(scope.ctx, 'test.tracker').open();
        assert.equal(tracker.size(), 2, 'Found 2 services');

        let refs = tracker.getReferences();
        assert.equal(refs[0].getProperty(OBJECTCLASS), 'test.tracker');
        assert.equal(refs[1].getProperty(OBJECTCLASS), 'test.tracker');
    });
});
describe('odss.core.tracker.BundleTracker', () => {
    const scope: any = {};
    beforeEach(async () => {
        scope.factory = await tests.factory();
        scope.bundle = await scope.factory.bundle('service');
        scope.bundle.start();
        scope.ctx = scope.bundle.context;

        scope.listener = {
            addingBundle: function (/* bundle */) {},
            removedBundle: function (/* bundle */) {},
        };
        try {
            sinon.spy(scope.listener, 'addingBundle');
            sinon.spy(scope.listener, 'removedBundle');
        } catch (e) {
            console.log(e);
        }
    });

    afterEach(() => {
        delete scope.factory;
        delete scope.bundle;
        delete scope.ctx;
    });

    it('bundle tracker properties', async () => {
        let bundle = await scope.factory.bundle('service.next', true);

        let tracker = new BundleTracker(scope.ctx, Bundles.INSTALLED);

        assert.equal(tracker.size(), 0, 'Tracker size should be 0');
        assert.equal(tracker.bundles().length, 0, 'Tracker bundles should return empty array');

        tracker.open(); //after start shoud found bundles: system and service

        assert.equal(tracker.size(), 3, 'Tracker size should be 3');
        assert.equal(tracker.bundles().length, 3, 'Tracker bundles should return array');

        tracker.close();

        assert.equal(tracker.size(), 0, 'Tracker size should be 0');
        assert.equal(tracker.bundles().length, 0, 'Tracker bundles should return empty array');

        tracker.open();

        await bundle.uninstall();

        assert.equal(tracker.size(), 2, 'Tracker size should be 1');
        assert.equal(tracker.bundles().length, 2, 'Tracker bundles should return not empty array');
    });

    it('custom listener', async () => {
        new BundleTracker(scope.ctx, Bundles.ACTIVE, scope.listener).open();

        assert.equal(
            scope.listener.addingBundle.callCount,
            2,
            'Not fire: addingBundle for installed bundles'
        );

        let bundle = await scope.factory.bundle('service.next');
        await bundle.start();

        assert.equal(
            scope.listener.addingBundle.callCount,
            3,
            'Not fire: addingBundle for new bundle'
        );

        await bundle.uninstall();

        assert.equal(
            scope.listener.removedBundle.callCount,
            1,
            'Not fire: removeBundle in custom bundle tracker listener'
        );
    });

    it('notify listener on close tracker', () => {
        let tracker = new BundleTracker(scope.ctx, Bundles.ACTIVE, scope.listener).open();
        tracker.close();
        assert.equal(
            scope.listener.addingBundle.callCount,
            2,
            'Not fire: addingBundle after tracker close'
        );
        assert.equal(tracker.size(), 0);
    });
});
