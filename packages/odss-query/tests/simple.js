import squery from '../src/index';



let check = (query, obj) => squery(query).match(obj);

QUnit.test('simple check', assert => {
    assert.ok(check('*', {name: 'Jon Snow'}) === true, 1);
    assert.ok(check('name=*', {name: 'Jon Snow'}) === true, 2);
    assert.ok(check('name=Jon', {name: 'Jon Snow'}) === false, 3);
    assert.ok(check('name=Jon Snow', {name: 'Jon Snow'}) === true, 4);
    assert.ok(check('name=Jon*', {name: 'Jon Snow'}) === true, 5);
    assert.ok(check('name=*Snow', {name: 'Jon Snow'}) === true, 6);
    assert.ok(check('name~=Jon', {name: 'Jon Snow'}) === true, 7);
});
