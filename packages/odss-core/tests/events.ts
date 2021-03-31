import { assert } from 'chai';
import * as sinon from 'sinon';
import {
    Events,
    ServiceEvent,
    BundleEvent,
    FrameworkEvent
} from '@odss/common';

import EventDispatcher from '../src/events';

class TestFrameworkListener {
    frameworkEvent( /* event */ ) {}
}
class TestBundleListener {
    bundleEvent( /* event */ ) {}
}
class TestServiceListener {
    serviceEvent( /* event */ ) {}
}

describe('core/events', () => {
    it('imports', () => {
        assert.ok(Events.INSTALLED === 1, 'Events.INSTALLED');
        assert.ok(Events.STARTED === 2, 'Events.STARTED');
        assert.ok(Events.STOPPED === 4, 'Events.STOPPED');
        assert.ok(Events.UPDATED === 8, 'Events.UPDATED');
        assert.ok(Events.UNINSTALLED === 10, 'Events.UNINSTALLED');
        assert.ok(Events.RESOLVED === 20, 'Events.RESOLVED');
        assert.ok(Events.UNRESOLVED === 40, 'Events.UNRESOLVED');
        assert.ok(Events.STARTING === 80, 'Events.STARTING');
        assert.ok(Events.STOPPING === 100, 'Events.STOPPING');
        assert.ok(Events.REGISTERED === 1, 'Events.REGISTERED');
        assert.ok(Events.MODIFIED === 2, 'Events.MODIFIED');
        assert.ok(Events.UNREGISTERED === 4, 'Events.UNREGISTERED');
        assert.ok(Events.MODIFIED_ENDMATCH === 8, 'Events.MODIFIED_ENDMATCH');
    });

    let bundle;
    let ed;

    beforeEach(() => {
        bundle = {};
        ed = new EventDispatcher();
    })

    afterEach(() => {
        bundle = null;
        ed = null;
    });

    it('test listeners', () => {
        let spy = sinon.spy();
        let ed = new EventDispatcher();

        assert.equal(true, ed.framework.add(bundle, spy));
        //add second time
        assert.equal(false, ed.framework.add(bundle, spy));

        ed.framework.fire(new FrameworkEvent(1, 2 as any));

        assert.deepEqual(1, spy.callCount);
        assert.deepEqual(1, spy.args[0][0].type);

        spy.resetHistory();

        assert.equal(true, ed.framework.remove(bundle, spy));
        ed.framework.fire(new FrameworkEvent(1, 2 as any));

        assert.equal(false, spy.calledOnce);
    });
    it('test framework listeners as object', () => {
        let listener = new TestFrameworkListener();
        let spy = sinon.spy(listener, 'frameworkEvent');

        assert.equal(true, ed.framework.add(bundle, spy));
        //add second time
        assert.equal(false, ed.framework.add(bundle, spy));
        ed.framework.fire(new FrameworkEvent(1, 2 as any));

        assert.deepEqual(1, spy.callCount);

        spy.resetHistory();
        assert.equal(true, ed.framework.remove(bundle, spy));
        ed.framework.fire(new FrameworkEvent(1, 2 as any));
        assert.equal(false, spy.called);
    });
    it('test bundle listeners as callback', () => {
        let spy = sinon.spy();

        assert.equal(true, ed.bundle.add(bundle, spy));
        //add second time
        assert.equal(false, ed.bundle.add(bundle, spy));

        ed.bundle.fire(new BundleEvent(1, 2 as any));

        assert.deepEqual(1, spy.callCount);
        assert.deepEqual(1, spy.args[0][0].type);

        spy.resetHistory();

        assert.equal(true, ed.bundle.remove(bundle, spy));
        ed.bundle.fire(new BundleEvent(1, 2 as any));

        assert.equal(false, spy.calledOnce);
    });
    it('test bundle listeners as object', () => {
        let listener = new TestBundleListener();
        let spy = sinon.spy(listener, 'bundleEvent');

        assert.equal(true, ed.bundle.add(bundle, spy));
        //add second time
        assert.equal(false, ed.bundle.add(bundle, spy));
        ed.bundle.fire(new BundleEvent(1, 2 as any));

        assert.deepEqual(1, spy.callCount);

        spy.resetHistory();
        assert.equal(true, ed.bundle.remove(bundle, spy));
        ed.bundle.fire(new BundleEvent(1, 2 as any));
        assert.equal(false, spy.called);
    });
    it('service listeners as callback', () => {
        let spy = sinon.spy();

        assert.equal(true, ed.service.add(bundle, spy, null, '(*)'), 'Expected true for add first listener');
        assert.equal(false, ed.service.add(bundle, spy, null, '(*)'), 'Expected false for add the same listener');

        ed.service.fire(new ServiceEvent(1, {
            bundle: 1,
            getProperties(){
                return {objectclass: 'filter'};
            }
        } as any));

        assert.deepEqual(1, spy.callCount, 'Expected only one notify for double listener');
        assert.deepEqual(1, spy.args[0][0].type, 'Expected event type');

        spy.resetHistory();

        assert.equal(true, ed.service.remove(bundle, spy), 'Remove action should return: "true"');
        ed.service.add(new ServiceEvent(1, {
            bundle: 2,
            getProperties(){
                return {objectclass: 'filter'};
            }
        } as any));

        assert.equal(false, spy.calledOnce, 'Expected only one notify for single listener');
    });

    it('test service listeners as object', () => {
        let listener = new TestServiceListener();
        let spy = sinon.spy(listener, 'serviceEvent');

        assert.equal(true, ed.service.add(bundle, spy));
        //add second time
        assert.equal(false, ed.service.add(bundle, spy));
        ed.service.fire(new ServiceEvent(1, {
            bundle: 2,
            getProperties(){
                return {objectclass: 'filter'}
            }
        } as any));

        assert.deepEqual(1, spy.callCount);

        spy.resetHistory();
        assert.equal(true, ed.service.remove(bundle, spy));
        ed.service.fire(new ServiceEvent(1, {
            bundle: 2,
            getProperties() {
                return {objectclass: 'filter'};
            }
        } as any));
        assert.equal(false, spy.called);
    });

    it('test remove all bundle listeners', () => {
        let spy = sinon.spy();
        assert.equal(true, ed.service.add(bundle, spy));
        assert.equal(true, ed.bundle.add(bundle, spy));
        assert.equal(true, ed.framework.add(bundle, spy));

        assert.equal(1, ed.framework.size());
        assert.equal(1, ed.bundle.size());
        assert.equal(1, ed.service.size());

        ed.removeAll(bundle);

        assert.equal(0, ed.framework.size());
        assert.equal(0, ed.bundle.size());
        assert.equal(0, ed.service.size());
    });

    it('service filters', () => {
        let spy = sinon.spy();

        ed.service.add(bundle, spy, 'filter');

        ed.service.fire(new ServiceEvent(123, {
            bundle: bundle,
            name: 'test',
            getProperties() {
                return {objectclass: 'filter'}
            }
        } as any));
        ed.service.fire(new ServiceEvent(123, {
            bundle: bundle,
            name: 'filter',
            getProperties() {
                return {objectclass: 'filter'}
            }
        } as any));
        assert.equal(2, spy.callCount);

        spy = sinon.spy();

        //catch all - *
        ed.service.add(bundle, spy);
        ed.service.fire(new ServiceEvent(123, {
            bundle: bundle,
            name: 'test',
            getProperties() {
                return {objectclass: 'filter'}
            }
        } as any));
        ed.service.fire(new ServiceEvent(123, {
            bundle: bundle,
            name: 'filter',
            getProperties() {
                return {objectclass: 'filter'}
            }
        } as any));
        assert.equal(2, spy.callCount);
    });
});
