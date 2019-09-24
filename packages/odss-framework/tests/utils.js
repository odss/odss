import {OBJECTCLASS, SERVICE_ID} from '@odss/common';
import * as $utils from '../src/utils';

QUnit.test('import', assert =>  {
    assert.ok(OBJECTCLASS === 'objectclass', 'consts.OBJECTCLASS');
    assert.ok(SERVICE_ID === 'service_id', 'consts.SERVICE_ID');
    assert.ok(typeof $utils.prepareFilter === 'function', '$utils.prepareFilter');
});

QUnit.module('@odss/framework::utils');

QUnit.test('prepare filter from class name', assert =>  {
    let filter = $utils.prepareFilter('some.simple.test');

    assert.equal(filter.name, OBJECTCLASS);
    assert.equal(filter.value, 'some.simple.test');
    assert.equal(filter.opt, 'eq');
});

QUnit.test('prepare filter from function', assert =>  {
    let func = function some_simple_Test() {};

    let filter = $utils.prepareFilter(func);
    assert.equal(filter.name, OBJECTCLASS);
    assert.equal(filter.value, 'some.simple.Test');
    assert.equal(filter.opt, 'eq');
});

QUnit.test('prepare filter from ldap query', assert =>  {
    let filter = $utils.prepareFilter(null, '(' + OBJECTCLASS + '=some.simple.test)');
    assert.equal(filter.name, OBJECTCLASS);
    assert.equal(filter.value, 'some.simple.test');
    assert.equal(filter.opt, 'eq');
});

QUnit.test('prepare filters in array', assert =>  {
    let filter = $utils.prepareFilter(['one', 'two', 'three']);

    assert.equal(filter.opt, 'or');
    assert.equal(filter.value.length, 3);
    assert.equal(filter.name, '');

    let filters = filter.value;

    assert.equal(filters[0].opt, 'eq');
    assert.equal(filters[0].name, OBJECTCLASS);
    assert.equal(filters[0].value, 'one');

    assert.equal(filters[1].opt, 'eq');
    assert.equal(filters[1].name, OBJECTCLASS);
    assert.equal(filters[1].value, 'two');

    assert.equal(filters[2].opt, 'eq');
    assert.equal(filters[2].name, OBJECTCLASS);
    assert.equal(filters[2].value, 'three');
});
