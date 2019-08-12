import {Bundles} from '@odss/common';
import Bundle from '../src/bundle';


QUnit.test('imports', assert =>  {
    assert.ok(typeof Bundle === 'function', 'import Bundle');
    assert.ok(Bundles, 'import Bundles');
    assert.ok(Bundles.UNINSTALLED === 1, 'Bundle.UNINSTALLED');
    assert.ok(Bundles.INSTALLED === 2, 'Bundle.INSTALLED');
    assert.ok(Bundles.RESOLVED === 4, 'Bundle.RESOLVED');
    assert.ok(Bundles.STARTING === 8, 'Bundle.STARTING');
    assert.ok(Bundles.STOPPING === 16, 'Bundle.STOPPING');
    assert.ok(Bundles.ACTIVE === 32, 'Bundle.ACTIVE');

});

QUnit.test('meta', assert =>  {
    let bundle = new Bundle(123, {}, {
        name: 'test',
        namespace: 'ntest'
    });
    assert.equal(bundle.meta.name, 'test');
    assert.equal(bundle.meta.namespace, 'ntest');
    assert.equal(bundle.meta.version, '0.0.0');
});
