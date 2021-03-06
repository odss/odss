import {OBJECTCLASS, SERVICE_ID} from '@odss/common';
import * as $utils from '../src/utils';

QUnit.test('import', assert =>  {
    assert.ok(OBJECTCLASS === 'objectclass', 'consts.OBJECTCLASS');
    assert.ok(SERVICE_ID === 'service_id', 'consts.SERVICE_ID');
    assert.ok(typeof $utils.functionName === 'function', '$utils.functionName');
    assert.ok(typeof $utils.functionNames === 'function', '$utils.functionNames');
    assert.ok(typeof $utils.prepareFilter === 'function', '$utils.prepareFilter');
});

QUnit.module('@odss/framework::utils');

QUnit.test('incorrect name type', assert =>  {
    assert.throws(() => {
        $utils.functionName();
    }, 'Not found function name');

    assert.throws(() => {
        $utils.functionName(undefined);
    }, 'Incorect function name: undefined');

    assert.throws(() => {
        $utils.functionName('');
    }, 'Empty function name');
});

QUnit.test('prepare function name', assert =>  {
    assert.equal($utils.functionName('test'), 'test', 'Service name as string');

    let functionWithName = function functionWithName() {};
    assert.equal($utils.functionName(functionWithName), 'functionWithName', 'Service name as funtion name');

    let namespaceFunction = function a_b_c_d_NamespaceFunction() {};
    assert.equal($utils.functionName(namespaceFunction), 'a.b.c.d.NamespaceFunction', 'Service name as funtion name with namespace');

    function SomeFunction() {}
    SomeFunction.$namespace = 'a.b.c.d';
    assert.equal($utils.functionName(SomeFunction), 'a.b.c.d.SomeFunction', 'Service name with custom namespace');
});

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
