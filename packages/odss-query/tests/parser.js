import squery from '../src/index';

QUnit.module('squery()');

QUnit.test('incorect syntax of query', assert => {
    assert.throws(function() {
        squery();
    }, 'squery()');
    assert.throws(function() {
        squery('');
    }, 'squery()');
    assert.throws(function() {
        squery(' ');
    }, 'squery()');
    assert.throws(function() {
        squery('(');
    }, 'Syntax: (');
    assert.throws(function() {
        squery(')');
    }, 'Syntax: )');
    assert.throws(function() {
        squery('()');
    }, 'Syntax: ()');
    assert.throws(function() {
        squery('(name=)');
    }, 'Syntax: (name=)');
    assert.throws(function() {
        squery('(=value)');
    }, 'Syntax: (=value');
    assert.throws(function() {
        squery('(name<value)');
    }, 'Syntax: (name<value) Should be: (name<=value)');
    assert.throws(function() {
        squery('(name>value)');
    }, 'Syntax: (name>value) Should be: (name>=value)');
    assert.throws(function() {
        squery('(name~value)');
    }, 'Syntax: (name~value) Should be: (name~=value)');

});
QUnit.test('simpe query (name=value)', assert =>  {
    let filter = squery('(name=value)');
    assert.equal(filter.name, 'name', 'Incorect filter name');
    assert.equal(filter.value, 'value', 'Incorect filter value');
    assert.equal(filter.opt, 'eq', 'Incorect filter opt');
});
QUnit.test('filter: match all (*)', assert =>  {
    let filter = squery('(*)');
    assert.equal(filter.name, '', 'Expect empty filter name');
    assert.equal(filter.value, null, 'Expect empty filter value');
    assert.equal(filter.opt, 'all', 'Incorect filter opt: $ldap.MATCH_ALL');
});
QUnit.test('filter: present (name=*)', assert =>  {
    let filter = squery('(name=*)');
    assert.equal(filter.name, 'name', 'Expect filter name');
    assert.equal(filter.value, '*', 'Expect filter value');
    assert.equal(filter.opt, 'present', 'Incorect filter opt: $ldap.PRESENT');
});
QUnit.test('filter: present (name)', assert =>  {
    let filter = squery('(name)');
    assert.equal(filter.name, 'name', 'Expect filter name');
    assert.equal(filter.value, '*', 'Expect filter value');
    assert.equal(filter.opt, 'present', 'Incorect filter opt: $ldap.PRESENT');
});
QUnit.test('filter: substring (name=*value*)', assert =>  {
    let filter = squery('(name=*value*)');
    assert.equal(filter.name, 'name', 'Expect filter name');
    assert.equal(filter.value + '', /^.*?value.*?$/ + '', 'Expect filter value');
    assert.equal(filter.opt, 'substring', 'Incorect filter opt: $ldap.SUBSTRING');
});
QUnit.test('filter: approx (name~=value)', assert =>  {
    let filter = squery('(name~=value)');
    assert.equal(filter.name, 'name', 'Expect filter name');
    assert.equal(filter.value, 'value', 'Expect filter value');
    assert.equal(filter.opt, 'approx', 'Incorect filter opt: $ldap.APPROX');
});
QUnit.test('filter: lte (name<=value)', assert =>  {
    let filter = squery('(name<=value)');
    assert.equal(filter.name, 'name', 'Expect filter name');
    assert.equal(filter.value, 'value', 'Expect filter value');
    assert.equal(filter.opt, 'lte', 'Incorect filter opt: $ldap.LTE');
});
QUnit.test('filter: gte (name>=value)', assert =>  {
    let filter = squery('(name>=value)');
    assert.equal(filter.name, 'name', 'Expect filter name');
    assert.equal(filter.value, 'value', 'Expect filter value');
    assert.equal(filter.opt, 'gte', 'Incorect filter opt: $ldap.GTE');
});
QUnit.test('filter: not (!(name=value))', assert =>  {
    let filter = squery('(!(name=value))');
    assert.equal(filter.name, '', 'Expect empty filter name');
    assert.equal(filter.opt, 'not', 'Incorect filter opt: $ldap.NOT');
});
QUnit.test('filter: eq (&(name=value))', assert =>  {
    let filter = squery('(&(name=value))');
    assert.equal(filter.opt, 'eq', 'Incorect filter opt: $ldap.AND');
});
QUnit.test('filter: eq (|(name=value))', assert =>  {
    let filter = squery('(|(name=value))');
    assert.equal(filter.opt, 'eq', 'Incorect filter opt: $ldap.OR');
});

QUnit.test('complex: (&(&(name1=value1)(name3=value3))(name2<=value2))', assert =>  {
    let filter = squery('(&(&(name1=value1)(name3=value3))(name2<=value2))');
    assert.equal(filter.opt, 'and', 'Incorect filter opt: $ldap.AND');
    assert.equal(filter.value.length, 2, 'Expect two sub filters');

    let sub = filter.value[0];
    assert.equal(sub.name, '', 'Expect filter name');
    assert.equal(sub.value.length, 2, 'Expect filter value');
    assert.equal(sub.opt, 'and', 'Incorect filter opt: $ldap.AND');

    sub = filter.value[0].value[0];
    assert.equal(sub.name, 'name1', 'Expect filter name');
    assert.equal(sub.value, 'value1', 'Expect filter value');
    assert.equal(sub.opt, 'eq', 'Incorect filter opt: $ldap.EQ');

    sub = filter.value[0].value[1];
    assert.equal(sub.name, 'name3', 'Expect filter name');
    assert.equal(sub.value, 'value3', 'Expect filter value');
    assert.equal(sub.opt, 'eq', 'Incorect filter opt: $ldap.EQ');


    sub = filter.value[1];
    assert.equal(sub.name, 'name2', 'Expect filter name');
    assert.equal(sub.value, 'value2', 'Expect filter value');
    assert.equal(sub.opt, 'lte', 'Incorect filter opt: $ldap.LTE');
});
