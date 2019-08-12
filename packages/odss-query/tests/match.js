import squery from '../src/index';


QUnit.module('squery() -> match()');

QUnit.test('simple query (name=value)', assert =>  {
    let filter = squery('(name=value)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({
        name: 'value1'
    }), false);
    assert.equal(filter.match({
        name1: 'value'
    }), false);
    assert.equal(filter.match({
        test: 'test'
    }), false);
});

QUnit.test('match: all (*)', assert =>  {
    let filter = squery('(*)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({}), true);
    assert.equal(filter.match(), true);

});
QUnit.test('match: present (name=*)', assert =>  {
    let filter = squery('(name=*)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({
        name: ''
    }), true);
    assert.equal(filter.match({
        name: false
    }), true);
    assert.equal(filter.match({
        name: null
    }), true);
    assert.equal(filter.match({
        name1: 'value'
    }), false);
});
QUnit.test('match: present (name)', assert =>  {
    let filter = squery('(name)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({
        name: ''
    }), true);
    assert.equal(filter.match({
        name: false
    }), true);
    assert.equal(filter.match({
        name: null
    }), true);
    assert.equal(filter.match({
        name1: 'value'
    }), false);
});
QUnit.test('match: substring (name=*value*)', assert =>  {
    let filter = squery('(name=*value*)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({
        name: 'prevaluepost'
    }), true);
    assert.equal(filter.match({
        name: 'valuepost'
    }), true);
    assert.equal(filter.match({
        name: 'prevalue'
    }), true);
    assert.equal(filter.match({
        name: 'test'
    }), false);
});
QUnit.test('match: substring (name=value*)', assert =>  {
    let filter = squery('(name=value*)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({
        name: 'valuepost'
    }), true);

    assert.equal(filter.match({
        name: 'prevaluepost'
    }), false);
    assert.equal(filter.match({
        name: 'prevalue'
    }), false);
    assert.equal(filter.match({
        name: 'test'
    }), false);
    assert.equal(filter.match({
        name: ''
    }), false);
    assert.equal(filter.match({
        name: null
    }), false);
});
QUnit.test('match: substring (name=*value)', assert =>  {
    let filter = squery('(name=*value)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({
        name: 'prevalue'
    }), true);

    assert.equal(filter.match({
        name: 'valuepost'
    }), false);
    assert.equal(filter.match({
        name: 'prevaluepost'
    }), false);
    assert.equal(filter.match({
        name: 'test'
    }), false);
    assert.equal(filter.match({
        name: ''
    }), false);
    assert.equal(filter.match({
        name: null
    }), false);
});
QUnit.test('match: approx (name~=value)', assert =>  {
    let filter = squery('(name~=value)');
    assert.equal(filter.match({
        name: 'value'
    }), true);
    assert.equal(filter.match({
        name: 'prevaluepost'
    }), true);
    assert.equal(filter.match({
        name: 'valuepost'
    }), true);
    assert.equal(filter.match({
        name: 'prevalue'
    }), true);
    assert.equal(filter.match({
        name: 'test'
    }), false);
});
QUnit.test('match: lte (name<=value)', assert =>  {
    let filter = squery('(name<=3)');
    assert.equal(filter.match({
        name: 2
    }), true);
    assert.equal(filter.match({
        name: 3
    }), true);
    assert.equal(filter.match({
        name: 4
    }), false);

});
QUnit.test('match: gte (name>=value)', assert =>  {
    let filter = squery('(name>=3)');
    assert.equal(filter.match({
        name: 4
    }), true);
    assert.equal(filter.match({
        name: 3
    }), true);
    assert.equal(filter.match({
        name: 2
    }), false);
});
QUnit.test('match: not (!(name=value))', assert =>  {
    let filter = squery('(!(name=value))');
    assert.equal(filter.match({
        name: 'value'
    }), false);
    assert.equal(filter.match({
        name: 'value1'
    }), true);
    assert.equal(filter.match({
        name1: 'value'
    }), true);
    assert.equal(filter.match({
        test: 'test'
    }), true);
});
QUnit.test('match: and (&(name1=value1)(name2=value2))', assert =>  {
    let filter = squery('(&(name1=value1)(name2=value2))');
    assert.equal(filter.match({}), false);
    assert.equal(filter.match({
        name1: 'value1'
    }), false);
    assert.equal(filter.match({
        name2: 'value2'
    }), false);
    assert.equal(filter.match({
        name1: 'value1',
        name2: 'value2'
    }), true);
});
QUnit.test('match: and (|(name1=value1)(name2=value2))', assert =>  {
    let filter = squery('(|(name1=value1)(name2=value2))');
    assert.equal(filter.match({}), false);
    assert.equal(filter.match({
        name1: 'value1'
    }), true);
    assert.equal(filter.match({
        name2: 'value2'
    }), true);
    assert.equal(filter.match({
        name1: 'value1',
        name2: 'value2'
    }), true);
});

let tags = {
    tags:['tag1', 'tag1.1', 'tag3.1', 'tag3.2']
};
QUnit.test('tags exists (tags=tag)', assert =>  {
    let filter = squery('(tags=tag)');
    assert.equal(filter.match(tags), false);
});
QUnit.test('tags exists (tags=tag1)', assert =>  {
    let filter = squery('(tags=tag1)');
    assert.equal(filter.match(tags), true);
});
QUnit.test('tags not exists (tags=tag3)', assert =>  {
    let filter = squery('(tags=tag3)');
    assert.equal(filter.match(tags), false);
});
QUnit.test('tags exists (tags=~tag1)', assert =>  {
    let filter = squery('(tags~=tag1)');
    assert.equal(filter.match(tags), true);
});
QUnit.test('tags not exists (tags=~tag2)', assert =>  {
    let filter = squery('(tags~=tag2)');
    assert.equal(filter.match(tags), false);
});
QUnit.test('tags not exists (tags=~tag3)', assert =>  {
    let filter = squery('(tags~=tag3)');
    assert.equal(filter.match(tags), true);
});
