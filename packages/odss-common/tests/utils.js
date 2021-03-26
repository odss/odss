import { getTokenType, getTokenTypes } from '../src/utils';

QUnit.test('import', assert => {
    assert.ok(typeof getTokenType === 'function', 'getTokenType');
    assert.ok(typeof getTokenTypes === 'function', 'getTokenTypes');
});

QUnit.module('@odss/framework::utils');

QUnit.test('incorrect name type', assert => {
    assert.throws(() => {
        getTokenType();
    }, 'Not found function name');

    assert.throws(() => {
        getTokenType(undefined);
    }, 'Incorect function name: undefined');

    assert.throws(() => {
        getTokenType('');
    }, 'Empty function name');
});

QUnit.test('prepare function name', assert => {
    assert.equal(getTokenType('test'), 'test', 'Service name as string');

    let functionWithName = function functionWithName() {};
    assert.equal(
        getTokenType(functionWithName),
        'functionWithName',
        'Service name as funtion name'
    );

    let namespaceFunction = function a_b_c_d_NamespaceFunction() {};
    assert.equal(
        getTokenType(namespaceFunction),
        'a.b.c.d.NamespaceFunction',
        'Service name as funtion name with namespace'
    );

    function SomeFunction() {}
    SomeFunction.$namespace = 'a.b.c.d';
    assert.equal(
        getTokenType(SomeFunction),
        'a.b.c.d.SomeFunction',
        'Service name with custom namespace'
    );
});
