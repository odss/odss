import squery from '../src/index';

QUnit.module('squery() -> filter()');


let filter = query => squery(query).filter(ITEMS);
let ITEMS = [{
    name: 'Jon',
    surname: 'Snow',
    age: 21,
    sex:'man',
}, {
    name: 'Eddard',
    surname: 'Stark',
    age: 50,
    sex:'man'
}, {
    name: 'Sansa',
    surname: 'Stark',
    age: 19,
    sex:'woman'
}, {
    name: 'Tyrion',
    surname:'Lannister',
    age: 31,
    sex:'man'
}, {
    name: 'Daenerys',
    surname: 'Targaryen',
    age: 24,
    sex:'woman'
}];

QUnit.test('catch all', assert => {
    assert.ok(filter('*').length === 5, '(*)');
});
QUnit.test('age <= 30', assert => {
    let young = filter('age<=30');
    assert.equal(young.length, 3);
    assert.equal(young[0].name, 'Jon');
    assert.equal(young[1].name, 'Sansa');
    assert.equal(young[2].name, 'Daenerys');
});
QUnit.test('Stark family', assert => {
    let stark = filter('|(surname=Stark)(&(name=Jon)(surname=Snow))');
    assert.equal(stark.length, 3);
    assert.equal(stark[0].name, 'Jon');
    assert.equal(stark[1].name, 'Eddard');
    assert.equal(stark[2].name, 'Sansa');
});
QUnit.test('no Stark name', assert => {
    assert.equal(filter('!(surname=Stark)').length, 3, '(!(name~=Stark))');
});
QUnit.test('Stark childs - string query', assert => {
    assert.equal(filter('|(name=Jon)(name=Sansa)').length, 2);
});
QUnit.test('Stark - Jon and Sansa - object query', assert => {
    assert.equal(filter({name:['Jon', 'Sansa']}).length, 2);
});
QUnit.test('Stark and man - string query', assert => {
    assert.equal(filter('&(sex=man)(surname=Stark)').length, 1);
});
QUnit.test('Stark and man - object query', assert => {
    assert.equal(filter({sex:'man', surname:'Stark'}).length, 1);
});
