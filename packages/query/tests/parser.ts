// @ts-nocheck
import { assert } from 'chai';
import { squery } from '../src/index';

describe('/parser/incorrect', () => {
    it('show catch empty query', () => {
        assert.throws(function () {
            squery('');
        }, 'Empty query.');
    });
    it('should catch empty space query', () => {
        assert.throws(function () {
            squery(' ');
        }, 'Empty query.');
    });
    it('should catch single: (', () => {
        assert.throws(function () {
            squery('(');
        });
        //}, 'Miss ending: )');
    });
    it('should catch single: )', () => {
        assert.throws(function () {
            squery(')');
        });
        //}, 'Miss starting: (');
    });
    it('should catch empty: ()', () => {
        assert.throws(function () {
            debugger;
            squery('()');
        });
        //}, 'Empty query.');
    });
    it('should catch: (name=)', () => {
        assert.throws(function () {
            squery('(name=)');
        });
        //}, 'Not found query value');
    });
    it('should catch: (=value)', () => {
        assert.throws(function () {
            squery('(=value)');
        });
        //}, 'Syntax: (=value');
    });
    it('should catch: (name<value)', () => {
        assert.throws(function () {
            squery('(name<value)');
        });
        //}, 'Syntax: (name<value) Should be: (name<=value)');
    });
    it('should catch: (name>value)', () => {
        assert.throws(function () {
            squery('(name>value)');
        });
        //}, 'Syntax: (name>value) Should be: (name>=value)');
    });
    it('should catch: (name~value)', () => {
        assert.throws(function () {
            squery('(name~value)');
        });
        // }, 'Syntax: (name~value) Should be: (name~=value)');
    });
});

describe('/parser/query', () => {
    it('simpe query (name=value)', () => {
        let filter = squery('(name=value)');
        assert.equal(filter.name, 'name', 'Incorect filter name');
        assert.equal(filter.value, 'value', 'Incorect filter value');
        assert.equal(filter.opt, 'eq', 'Incorect filter opt');
    });
    it('filter: match all (*)', () => {
        let filter = squery('(*)');
        assert.equal(filter.opt, 'all', 'Incorect filter opt: $ldap.MATCH_ALL');
    });
    it('filter: present (name=*)', () => {
        let filter = squery('(name=*)');
        assert.equal(filter.name, 'name', 'Expect filter name');
        assert.equal(filter.opt, 'present', 'Incorect filter opt: $ldap.PRESENT');
    });
    it('filter: present (name)', () => {
        let filter = squery('(name)');
        assert.equal(filter.name, 'name', 'Expect filter name');
        assert.equal(filter.opt, 'present', 'Incorect filter opt: $ldap.PRESENT');
    });
    it('filter: substring (name=*value*)', () => {
        let filter = squery('(name=*value*)');
        assert.equal(filter.name, 'name', 'Expect filter name');
        assert.equal(filter.regexp + '', /^.*?value.*?$/ + '', 'Expect filter value');
        assert.equal(filter.opt, 'substring', 'Incorect filter opt: $ldap.SUBSTRING');
    });
    it('filter: approx (name~=value)', () => {
        let filter = squery('(name~=value)');
        assert.equal(filter.name, 'name', 'Expect filter name');
        assert.equal(filter.value, 'value', 'Expect filter value');
        assert.equal(filter.opt, 'approx', 'Incorect filter opt: $ldap.APPROX');
    });
    it('filter: lte (name<=value)', () => {
        let filter = squery('(name<=value)');
        assert.equal(filter.name, 'name', 'Expect filter name');
        assert.equal(filter.value, 'value', 'Expect filter value');
        assert.equal(filter.opt, 'lte', 'Incorect filter opt: $ldap.LTE');
    });
    it('filter: gte (name>=value)', () => {
        let filter = squery('(name>=value)');
        assert.equal(filter.name, 'name', 'Expect filter name');
        assert.equal(filter.value, 'value', 'Expect filter value');
        assert.equal(filter.opt, 'gte', 'Incorect filter opt: $ldap.GTE');
    });
    it('filter: not (!(name=value))', () => {
        let filter = squery('(!(name=value))');
        assert.equal(filter.filters.length, 1, 'Expect empty filter name');
        assert.equal(filter.opt, 'not', 'Incorect filter opt: $ldap.NOT');
    });
    it('filter: eq (&(name=value))', () => {
        let filter = squery('(&(name=value))');
        assert.equal(filter.opt, 'eq', 'Incorect filter opt: $ldap.AND');
    });
    it('filter: eq (|(name=value))', () => {
        let filter = squery('(|(name=value))');
        assert.equal(filter.opt, 'eq', 'Incorect filter opt: $ldap.OR');
    });

    it('complex: (&(&(name1=value1)(name3=value3))(name2<=value2))', () => {
        let filter = squery('(&(&(name1=value1)(name3=value3))(name2<=value2))');
        assert.equal(filter.opt, 'and', 'Incorect filter opt: $ldap.AND');
        assert.equal(filter.filters.length, 2, 'Expect two sub filters');

        let sub = filter.filters[0];
        assert.equal(sub.filters.length, 2, 'Expect filter value');
        assert.equal(sub.opt, 'and', 'Incorect filter opt: $ldap.AND');

        sub = filter.filters[0].filters[0];
        assert.equal(sub.name, 'name1', 'Expect filter name');
        assert.equal(sub.value, 'value1', 'Expect filter value');
        assert.equal(sub.opt, 'eq', 'Incorect filter opt: $ldap.EQ');

        sub = filter.filters[0].filters[1];
        assert.equal(sub.name, 'name3', 'Expect filter name');
        assert.equal(sub.value, 'value3', 'Expect filter value');
        assert.equal(sub.opt, 'eq', 'Incorect filter opt: $ldap.EQ');

        sub = filter.filters[1];
        assert.equal(sub.name, 'name2', 'Expect filter name');
        assert.equal(sub.value, 'value2', 'Expect filter value');
        assert.equal(sub.opt, 'lte', 'Incorect filter opt: $ldap.LTE');
    });
});
