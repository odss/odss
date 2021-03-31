import { assert } from 'chai';

import { getTokenType, getTokenTypes } from '../src/utils';

describe('@odss/common::utils', () => {
    it('import()', () => {
        assert.ok(typeof getTokenType === 'function', 'getTokenType');
        assert.ok(typeof getTokenTypes === 'function', 'getTokenTypes');
    });
    it('incorrect name type', () => {
        assert.throws(() => {
            getTokenType('');
        }, 'Empty function name');
    });

    it('prepare function name', () => {
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
});
