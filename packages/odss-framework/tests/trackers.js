import sinon from 'sinon';
import {
    OBJECTCLASS,
    Bundles,
    ServiceTracker, BundleTracker
} from 'odss-common';

import tests from './core';



QUnit.module("sosig.tracker.getService()Tracker", hook => {

    const scope = {};

    hook.beforeEach(async () => {
        scope.factory = await tests.factory(true);
        scope.bundle = await scope.factory.bundle('service');
        await scope.bundle.start();
        scope.ctx = scope.bundle.context;
    });
    hook.afterEach(() => {
        delete scope.factory;
        delete scope.bundle;
        delete scope.ctx;
    });

    QUnit.test('init tracker', assert =>  {
        let bundle = scope.bundle;
        assert.throws(() => {
            new ServiceTracker();
        }, 'Empty bundle.contextt');

        assert.throws(() => {
            new ServiceTracker(bundle.context);
        }, 'Empty name');
    });
    QUnit.test('register/unregister service', assert =>  {
        let counter = 0;
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker', {
            addingService() {
                counter |= 1;
            },
            removedService() {
                counter |= 2;
            }
        });
        tracker.open();
        let reg = scope.ctx.registerService('test.tracker', 'test');

        reg.unregister();

        assert.equal(counter & 1, 1, 'Not fire ServiceTracker.addingService(ref)');
        assert.equal(counter & 2, 2, 'Not fire ServiceTracker.removedService(ref)');

    });
    QUnit.test('tracker properties', assert =>  {
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker');
        assert.equal(tracker.size(), 0, 'Tracker size should assert.equal 0');
        assert.equal(tracker.getReferences().length, 0, 'Tracker references should return empty array');
        assert.equal(tracker.getReference(), null, 'Tracker reference should assert.equal null');
        assert.equal(tracker.getServices().length, 0, 'Tracker services should return empty array');
        assert.equal(tracker.getService(), null, 'Tracker services should return empty array');

        tracker.open();

        let reg = scope.ctx.registerService('test.tracker', 'test');

        assert.equal(tracker.size(), 1, 'Tracker size should assert.equal 0');
        assert.equal(tracker.getReferences().length, 1, 'Tracker references should return not empty array');
        assert.deepEqual(tracker.getServices(), ['test'], 'Tracker services should return array: [test]');
        assert.equal(tracker.getService(), 'test', 'Tracker services should return: test');

        reg.unregister();

        assert.equal(tracker.size(), 0, 'Tracker size should assert.equal 0');
        assert.equal(tracker.getReferences().length, 0, 'Tracker references should return not empty array');
        assert.equal(tracker.reference, null, 'Tracker reference incorrect');
        assert.deepEqual(tracker.getServices(), [], 'Tracker services should return array: [test]');
        assert.equal(tracker.getService(), null, 'Tracker services should return: test');


        reg = scope.ctx.registerService('test.tracker', 'test');

        assert.equal(tracker.size(), 1, 'Tracker size should assert.equal 0');
        assert.equal(tracker.getReferences().length, 1, 'Tracker references should return not empty array');
        assert.deepEqual(tracker.getServices(), ['test'], 'Tracker services should return array: [test]');
        assert.equal(tracker.getService(), 'test', 'Tracker services should return: test');

        tracker.close();

        assert.equal(tracker.size(), 0, 'Tracker size should assert.equal 0');
        assert.equal(tracker.getReferences().length, 0, 'Tracker references should return not empty array');
        assert.equal(tracker.reference, null, 'Tracker reference incorrect');
        assert.deepEqual(tracker.getServices(), [], 'Tracker services should return array: [test]');
        assert.equal(tracker.getService(), null, 'Tracker services should return: test');

    });

    QUnit.test('stop tracker', assert =>  {
        let counter = 0;
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker', {
            addingService() {
                counter |= 1;
            },
            removedService() {
                counter |= 2;
            }
        });
        tracker.open();
        scope.ctx.registerService('test.tracker', 'test1');
        assert.equal(counter, 1, 'Tracker should run addingService listener methods');
        tracker.close();
        scope.ctx.registerService('test.tracker', 'test2');
        assert.equal(counter, 3);
    });

    QUnit.test('start tracker after register service', assert =>  {

        scope.ctx.registerService('test.tracker', 'test');
        let counter = 0;
        let tracker = new ServiceTracker(scope.ctx, 'test.tracker', {
            addingService: function(/* reference */) {
                counter++;
            }
        });

        tracker.open();
        assert.equal(counter, 1, 'Should find one register service');

        scope.ctx.registerService('test.tracker', 'test');
        assert.equal(counter, 2, 'Should find second register serivce');

    });

    QUnit.test('ServiceTracker::reference', assert =>  {
        scope.ctx.registerService('test.tracker', 'test1');
        scope.ctx.registerService('test.tracker', 'test2');

        let tracker = new ServiceTracker(scope.ctx, 'test.tracker').open();
        assert.equal(tracker.size(), 2, 'Found 2 services');
        let ref = tracker.getReference();
        assert.equal(ref.property(OBJECTCLASS), 'test.tracker');
    });

    QUnit.test('ServiceTracker::getServiceReferences()', assert =>  {

        scope.ctx.registerService('test.tracker', 'test1');
        scope.ctx.registerService('test.tracker', 'test2');

        let tracker = new ServiceTracker(scope.ctx, 'test.tracker').open();
        assert.equal(tracker.size(), 2, 'Found 2 services');

        let refs = tracker.getReferences();
        assert.equal(refs[0].property(OBJECTCLASS), 'test.tracker');

        assert.equal(refs[1].property(OBJECTCLASS), 'test.tracker');
    });

});
QUnit.module("odss.core.tracker.BundleTracker", hook => {
    const scope = {}
    hook.beforeEach(async () => {
        scope.factory = await tests.factory(true);
        scope.bundle = await scope.factory.bundle('service');
        scope.bundle.start();
        scope.ctx = scope.bundle.context;

        scope.listener = {
            addingBundle: function(/* bundle */) {},
            removedBundle: function(/* bundle */) {}
        };
        sinon.spy(scope.listener, 'addingBundle');
        sinon.spy(scope.listener, 'removedBundle');
    });

    hook.afterEach(() => {
        delete scope.factory;
        delete scope.bundle;
        delete scope.ctx;
    });

    QUnit.test('bundle tracker properties', async assert =>  {

        let bundle = await scope.factory.bundle('service.next', true);

        let tracker = new BundleTracker(scope.ctx, Bundles.INSTALLED);


        assert.equal(tracker.size(), 0, 'Tracker size should be 0');
        assert.equal(tracker.bundles().length, 0, 'Tracker bundles should return empty array');
        assert.equal(tracker.bundle, null, 'Tracker bundle should assert.equal null');


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

    QUnit.test('custom listener', async assert =>  {
        new BundleTracker(scope.ctx, Bundles.ACTIVE, scope.listener).open();

        assert.equal(scope.listener.addingBundle.callCount, 2, 'Not fire: addingBundle for installed bundles');

        let bundle = await scope.factory.bundle('service.next');
        await bundle.start();

        assert.equal(scope.listener.addingBundle.callCount, 3, 'Not fire: addingBundle for new bundle');

        await bundle.uninstall();

        assert.equal(scope.listener.removedBundle.callCount, 1, 'Not fire: removeBundle in custom bundle tracker listener');
    });

    QUnit.test('notify listener on close tracker', assert =>  {
        let tracker = new BundleTracker(scope.ctx, Bundles.ACTIVE, scope.listener).open();
        tracker.close();
        assert.equal(scope.listener.addingBundle.callCount, 2, 'Not fire: addingBundle after tracker close');
        assert.equal(tracker.size(), 0);
    });
});