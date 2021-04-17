import { assert } from 'chai';
import * as sinon from 'sinon';
import { Events, Bundles } from '@odss/common';

import { Framework } from '../src/framework';

import tests from './core';

let self: any = {};

describe('odss-core', () => {
    beforeEach(async function () {
        self.bundle = await tests.bundle('event');
    });
    afterEach(function () {
        self.bundle = null;
    });

    it('get property', async () => {
        let framework = await tests.framework();
        assert.equal(framework.getProperty('prop1'), 'test1');
        assert.equal(framework.getProperty('prop2'), 'test2');
        assert.deepEqual(framework.getProperty('unexists'), null, 'Not exists property');
        assert.equal(framework.getProperty('unexists', 'iknow'), 'iknow', 'Default property');
    });

    it('get bundles', async () => {
        let factor = await tests.factory();
        await factor.bundle('test1');
        await factor.bundle('test2');
        let bundle = await factor.bundle('test3');

        let framework = await factor.framework();
        assert.equal(4, framework.getBundles().length);

        await framework.uninstallBundle(bundle);

        assert.equal(3, framework.getBundles().length);
    });
    it('get unexists bundle', async () => {
        let framework = await tests.framework();
        assert.throws(() => {
            framework.getBundle(1);
        });
    });

    it('get bundle', async () => {
        await tests.framework();
        let bundle1 = await tests.bundle('test1');
        let bundle2 = await tests.bundle('test2');
        assert.equal(bundle1.id, bundle2.id);
    });

    // it('framework uninstall error', async () => {
    //     let framework = await tests.framework();
    //     assert.throws(() => {
    //         framework.uninstall();
    //     });
    // });

    it('state on start/stop framework', async () => {
        let framework = await tests.framework();
        console.log(framework.state, Bundles.INSTALLED);
        assert.equal(framework.state, Bundles.INSTALLED, 'installed');

        await framework.start();

        assert.equal(framework.state, Bundles.ACTIVE, 'active');

        await framework.stop();

        assert.equal(framework.state, Bundles.RESOLVED, 'resolved');
    });

    it('start/stop all bundles', async () => {
        let framework = await tests.framework();

        let listener = sinon.spy();
        assert.equal(true, framework.on.bundle.add(self.bundle, listener));

        await framework.installBundle('test1', false);
        await framework.installBundle('test2', false);

        let bundle1 = framework.getBundle('test1');
        let bundle2 = framework.getBundle('test2');

        assert.equal(Bundles.INSTALLED, bundle1.state, 'bundle1 === INSTALLED');
        assert.equal(Bundles.INSTALLED, bundle2.state, 'bundle2 === INSTALLED');

        await framework.start();

        assert.equal(Bundles.ACTIVE, bundle1.state, 'bundle1 === ACTIVE');
        assert.equal(Bundles.ACTIVE, bundle2.state, 'bundle2 === ACTIVE');

        await framework.uninstallBundle(bundle1 as any);
        await framework.uninstallBundle(bundle2 as any);

        //bundle: (x2)
        //  installed
        //  staring
        //  stared
        //  stopping
        //  stoped
        //  uninstalled
        //
        assert.equal(listener.callCount, 14);
    });
    it('auto start/stop all bundle', async () => {
        let framework = await tests.framework();
        await framework.installBundle('test1', false);
        await framework.installBundle('test2', false);
        let bundles = framework.getBundles();
        let bundle, i;
        for (i = 0; i < bundles.length; i++) {
            bundle = bundles[1];
            assert.equal(
                bundle.state,
                Bundles.INSTALLED,
                'Bundle: ' +
                    bundle.name +
                    ' have incorect state: ' +
                    bundle.state +
                    ' after install'
            );
        }

        await framework.start();
        for (i = 0; i < bundles.length; i++) {
            bundle = bundles[1];
            assert.equal(
                bundle.state,
                Bundles.ACTIVE,
                'Bundle: ' +
                    bundle.name +
                    ' have incorect state: ' +
                    bundle.state +
                    ' after install'
            );
        }

        await framework.stop();
        for (i = 0; i < bundles.length; i++) {
            bundle = bundles[1];
            assert.equal(
                bundle.state,
                Bundles.RESOLVED,
                'Bundle: ' +
                    bundle.name +
                    ' have incorect state: ' +
                    bundle.state +
                    ' after install'
            );
        }
    });

    it('framework listeners', async () => {
        let framework = new Framework();

        let listener = sinon.spy();
        assert.equal(true, framework.on.bundle.add(self.bundle, listener));

        await framework.start();

        assert.equal(Events.STARTING, listener.args[0][0].type);
        assert.equal(Events.STARTED, listener.args[1][0].type);
        assert.equal(2, listener.callCount);
    });
    it('framework bundle listeners', async () => {
        let framework = await tests.framework();

        let events = [];
        let listener = function (event) {
            events.push(event);
        };
        await framework.start();

        assert.equal(true, framework.on.bundle.add(self.bundle, listener));

        let bundle2 = await framework.installBundle('spy');
        let bundle = framework.getBundle('spy');

        assert.equal(Events.INSTALLED, events[0].type);

        await bundle.start();

        assert.equal(Events.STARTING, events[1].type);
        assert.equal(Events.STARTED, events[2].type);

        await bundle.stop();

        assert.equal(Events.STOPPING, events[3].type);
        assert.equal(Events.STOPPED, events[4].type);

        await bundle.uninstall();

        assert.equal(Events.UNINSTALLED, events[5].type);

        assert.equal(6, events.length);

        await framework.stop();
    });

    it('framework error listeners', async () => {
        let framework = await tests.framework();

        let listener = sinon.stub().throws('test');
        assert.equal(true, framework.on.framework.add(self.bundle, listener));

        await framework.start();
    });

    it('start bundle without activator', async () => {
        let framework = await tests.framework();
        await framework.installBundle('noactivator');
        assert.ok(framework.hasBundle('noactivator'), 'Not found bundle: noactivator');
    });
});
