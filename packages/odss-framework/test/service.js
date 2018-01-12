import {OBJECTCLASS, Events} from 'odss-common';
import Registry from '../src/service';


QUnit.test('import', assert =>  {
    assert.ok(typeof Registry === 'function', 'Registry');
});

let self = {};
QUnit.module("odss-framework.service", {
    beforeEach: () => {
        self.bundle = {
            id: 1
        };
        self.sbundle = {
            id: 2
        };
        self.events = {
            service: {
                _items: [],
                fire: function(event) {
                    this._items.forEach(function(callback) {
                        callback(event);
                    });
                },
                /* jshint unused:false */
                add: function(bundle, callback,  filter) {
                    this._items.push(callback);
                    return true;
                }
            }
        };
        self.registry = new Registry(self.events);
    },
    afterEach: () => {
        self.bundle = null;
        self.events = null;
        self.registry = null;
    }
});

QUnit.test('register service and check registration', assert =>  {
    let reg1 = self.registry.register(self.bundle, 'test', 'service');

    assert.notEqual(reg1, null);
    assert.equal(1, self.registry.size());
    assert.equal(1, self.registry.findBundleReferences(self.bundle).length);
    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);


    self.registry.register(self.bundle, 'test', 'service');
    assert.equal(2, self.registry.size());
    assert.equal(2, self.registry.findBundleReferences(self.bundle).length);
    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
});

QUnit.test('unregister service by registration object', assert =>  {
    let reg1 = self.registry.register(self.bundle, 'test1', 'service');
    let reg2 = self.registry.register(self.bundle, 'test2', 's2');

    assert.equal(2, self.registry.size());

    reg1.unregister();
    assert.equal(1, self.registry.size());

    reg2.unregister();
    assert.equal(0, self.registry.size());

});

QUnit.test('unregister all bundle services', assert =>  {

    self.registry.register(self.sbundle, 'test', 'service');
    self.registry.register(self.bundle, 'test', 's2');

    assert.equal(2, self.registry.size());

    self.registry.unregisterAll(self.bundle);
    assert.equal(1, self.registry.size());

    self.registry.unregisterAll(self.sbundle);
    assert.equal(0, self.registry.size());

});

QUnit.test('unregister using service', assert =>  {
    let reg = self.registry.register(self.bundle, 'test1', 's1');
    self.registry.find(self.sbundle, reg.reference);

    assert.throws(() => {
        reg.unregister();
    }, 'Try unregister service using by another bundle');

    assert.throws(() => {
        self.registry.unregister(self.sbundle, reg);
    }, 'Try unregister not my service');

});



QUnit.test('get service', assert =>  {
    let reg = self.registry.register(self.bundle, 'test', 'service');
    self.registry.find(self.sbundle, reg.reference);

    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
    assert.equal(1, self.registry.findBundleReferencesInUse(self.sbundle).length);
});

QUnit.test('unget()', assert =>  {
    let reg1 = self.registry.register(self.bundle, 'test', 'service');
    let reg2 = self.registry.register(self.bundle, 'test', 'service');

    self.registry.find(self.sbundle, reg1.reference);
    self.registry.find(self.sbundle, reg2.reference);


    //incorrect bundle
    self.registry.unget(self.bundle, reg1.reference);

    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
    assert.equal(2, self.registry.findBundleReferencesInUse(self.sbundle).length);

    //correct bundle
    self.registry.unget(self.sbundle, reg1.reference);

    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
    assert.equal(1, self.registry.findBundleReferencesInUse(self.sbundle).length);

    self.registry.unget(self.sbundle, reg2.reference);

    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
    assert.equal(0, self.registry.findBundleReferencesInUse(self.sbundle).length);

});

QUnit.test('ungetAll()', assert =>  {
    let reg1 = self.registry.register(self.bundle, 'test', 'service');
    let reg2 = self.registry.register(self.bundle, 'test', 'service');

    self.registry.find(self.sbundle, reg1.reference);
    self.registry.find(self.sbundle, reg2.reference);


    //incorrect bundle
    self.registry.ungetAll(self.bundle);

    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
    assert.equal(2, self.registry.findBundleReferencesInUse(self.sbundle).length);

    //correct bundle
    self.registry.ungetAll(self.sbundle);

    assert.equal(0, self.registry.findBundleReferencesInUse(self.bundle).length);
    assert.equal(0, self.registry.findBundleReferencesInUse(self.sbundle).length);

});

QUnit.test('register service with function namespace', assert =>  {
    let fn = function a_b_c_d_ITest() {};
    let reg = self.registry.register(self.bundle, fn, 'testService');
    assert.equal(reg.reference.properties[OBJECTCLASS], 'a.b.c.d.ITest', 'Incorect service namesapce');
    assert.equal(reg.reference.property(OBJECTCLASS), 'a.b.c.d.ITest', 'Incorect service namesapce in reference');

});

QUnit.test('change properties', assert =>  {
    let reg = self.registry.register(self.bundle, 'test', {
        key: 'value'
    });
    reg.update('key', 'test');
    assert.equal('test', reg.reference.property('key'));

});

QUnit.test('change properties event', assert =>  {

    let spy = sinon.spy();
    let reg = self.registry.register(self.bundle, 'test', {
        key: 'value'
    });
    reg.update('key', 'test');

    assert.equal(true, self.events.service.add(self.bundle, spy, '(*)'));

    reg.update('key', 'test');

    assert.deepEqual(1, spy.callCount);
    assert.deepEqual(Events.MODIFIED, spy.args[0][0].type);
    assert.deepEqual('test', spy.args[0][0].properties.key);

});
