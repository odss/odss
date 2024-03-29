import { assert } from 'chai';
import {
    OBJECTCLASS,
    SERVICE_FACTORY_PID,
    SERVICE_ID,
    SERVICE_PID,
    SERVICE_RANKING,
} from '@odss/common';
import * as $utils from '../src/utils';

describe('@odss/core/utils', () => {
    it('import', () => {
        assert.equal(OBJECTCLASS, '$objectclass$', 'consts.OBJECTCLASS');
        assert.equal(SERVICE_ID, '$service.id$', 'consts.SERVICE_ID');
        assert.equal(SERVICE_PID, '$service.pid$', 'consts.SERVICE_ID');
        assert.equal(SERVICE_FACTORY_PID, '$service.factory.pid$', 'consts.SERVICE_ID');
        assert.equal(SERVICE_RANKING, '$service.ranking$', 'consts.SERVICE_ID');
        assert.equal(typeof $utils.prepareFilter, 'function', '$utils.prepareFilter');
    });

    it('prepare filter from class name', () => {
        let filter = $utils.prepareFilter('some.simple.test');
        assert.equal(filter.name, OBJECTCLASS);
        assert.equal(filter.value, 'some.simple.test');
        assert.equal(filter.opt, 'eq');
    });

    it('prepare filter from function', () => {
        let func = function some_simple_Test() {};
        let filter = $utils.prepareFilter(func);
        assert.equal(filter.name, OBJECTCLASS);
        assert.equal(filter.value, 'some.simple.Test');
        assert.equal(filter.opt, 'eq');
    });

    it('prepare filter from ldap query', () => {
        let filter = $utils.prepareFilter(null, '(' + OBJECTCLASS + '=some.simple.test)');
        assert.equal(filter.name, OBJECTCLASS);
        assert.equal(filter.value, 'some.simple.test');
        assert.equal(filter.opt, 'eq');
    });

    it('prepare filters in array', () => {
        let filter = $utils.prepareFilter(['one', 'two', 'three']);

        assert.equal(filter.opt, 'or');
        assert.equal(filter.filters.length, 3);

        let filters = filter.filters;

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
});
