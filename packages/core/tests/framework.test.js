"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const common_1 = require("@odss/common");
const framework_1 = require("../src/framework");
const core_1 = require("./core");
let self = {};
describe('odss-core', () => {
    beforeEach(async function () {
        self.bundle = await core_1.default.bundle('event');
    });
    afterEach(function () {
        self.bundle = null;
    });
    it('get property', async () => {
        let framework = await core_1.default.framework();
        chai_1.assert.equal(framework.getProperty('prop1'), 'test1');
        chai_1.assert.equal(framework.getProperty('prop2'), 'test2');
        chai_1.assert.deepEqual(framework.getProperty('unexists'), null, 'Not exists property');
        chai_1.assert.equal(framework.getProperty('unexists', 'iknow'), 'iknow', 'Default property');
    });
    it('get bundles', async () => {
        let factor = await core_1.default.factory();
        await factor.bundle('test1');
        await factor.bundle('test2');
        let bundle = await factor.bundle('test3');
        let framework = await factor.framework();
        chai_1.assert.equal(4, framework.getBundles().length);
        await framework.uninstallBundle(bundle);
        chai_1.assert.equal(3, framework.getBundles().length);
    });
    it('get unexists bundle', async () => {
        let framework = await core_1.default.framework();
        chai_1.assert.throws(() => {
            framework.getBundleById(1);
        });
    });
    it('get bundle', async () => {
        await core_1.default.framework();
        let bundle1 = await core_1.default.bundle('test1');
        let bundle2 = await core_1.default.bundle('test2');
        chai_1.assert.equal(bundle1.id, bundle2.id);
    });
    // it('framework uninstall error', async () => {
    //     let framework = await tests.framework();
    //     assert.throws(() => {
    //         framework.uninstall();
    //     });
    // });
    it('state on start/stop framework', async () => {
        let framework = await core_1.default.framework();
        chai_1.assert.equal(framework.state, common_1.Bundles.INSTALLED, 'installed');
        await framework.start();
        chai_1.assert.equal(framework.state, common_1.Bundles.ACTIVE, 'active');
        await framework.stop();
        chai_1.assert.equal(framework.state, common_1.Bundles.RESOLVED, 'resolved');
    });
    it('start/stop all bundles', async () => {
        let framework = await core_1.default.framework();
        let listener = sinon.spy();
        chai_1.assert.equal(true, framework.on.bundle.add(self.bundle, listener));
        await framework.installBundle('test1', false);
        await framework.installBundle('test2', false);
        let bundle1 = framework.getBundleByName('test1');
        let bundle2 = framework.getBundleByName('test2');
        chai_1.assert.equal(common_1.Bundles.INSTALLED, bundle1.state, 'bundle1 === INSTALLED');
        chai_1.assert.equal(common_1.Bundles.INSTALLED, bundle2.state, 'bundle2 === INSTALLED');
        await framework.start();
        chai_1.assert.equal(common_1.Bundles.ACTIVE, bundle1.state, 'bundle1 === ACTIVE');
        chai_1.assert.equal(common_1.Bundles.ACTIVE, bundle2.state, 'bundle2 === ACTIVE');
        await framework.uninstallBundle(bundle1);
        await framework.uninstallBundle(bundle2);
        //bundle: (x2)
        //  installed
        //  staring
        //  stared
        //  stopping
        //  stoped
        //  uninstalled
        //
        chai_1.assert.equal(listener.callCount, 14);
    });
    it('auto start/stop all bundle', async () => {
        let framework = await core_1.default.framework();
        await framework.installBundle('test1', false);
        await framework.installBundle('test2', false);
        let bundles = framework.getBundles();
        let bundle, i;
        for (i = 0; i < bundles.length; i++) {
            bundle = bundles[1];
            chai_1.assert.equal(bundle.state, common_1.Bundles.INSTALLED, 'Bundle: ' +
                bundle.name +
                ' have incorect state: ' +
                bundle.state +
                ' after install');
        }
        await framework.start();
        for (i = 0; i < bundles.length; i++) {
            bundle = bundles[1];
            chai_1.assert.equal(bundle.state, common_1.Bundles.ACTIVE, 'Bundle: ' +
                bundle.name +
                ' have incorect state: ' +
                bundle.state +
                ' after install');
        }
        await framework.stop();
        for (i = 0; i < bundles.length; i++) {
            bundle = bundles[1];
            chai_1.assert.equal(bundle.state, common_1.Bundles.RESOLVED, 'Bundle: ' +
                bundle.name +
                ' have incorect state: ' +
                bundle.state +
                ' after install');
        }
    });
    it('framework listeners', async () => {
        let framework = new framework_1.Framework();
        let listener = sinon.spy();
        chai_1.assert.equal(true, framework.on.bundle.add(self.bundle, listener));
        await framework.start();
        chai_1.assert.equal(common_1.Events.STARTING, listener.args[0][0].type);
        chai_1.assert.equal(common_1.Events.STARTED, listener.args[1][0].type);
        chai_1.assert.equal(2, listener.callCount);
    });
    it('framework bundle listeners', async () => {
        let framework = await core_1.default.framework();
        let events = [];
        let listener = function (event) {
            events.push(event);
        };
        await framework.start();
        chai_1.assert.equal(true, framework.on.bundle.add(self.bundle, listener));
        let bundle2 = await framework.installBundle('spy');
        let bundle = framework.getBundle('spy');
        chai_1.assert.equal(common_1.Events.INSTALLED, events[0].type);
        await bundle.start();
        chai_1.assert.equal(common_1.Events.STARTING, events[1].type);
        chai_1.assert.equal(common_1.Events.STARTED, events[2].type);
        await bundle.stop();
        chai_1.assert.equal(common_1.Events.STOPPING, events[3].type);
        chai_1.assert.equal(common_1.Events.STOPPED, events[4].type);
        await bundle.uninstall();
        chai_1.assert.equal(common_1.Events.UNINSTALLED, events[5].type);
        chai_1.assert.equal(6, events.length);
        await framework.stop();
    });
    it('start bundle without activator', async () => {
        let framework = await core_1.default.framework();
        await framework.installBundle('noactivator');
        chai_1.assert.ok(framework.hasBundle('noactivator'), 'Not found bundle: noactivator');
    });
});
