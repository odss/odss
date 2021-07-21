// @ts-nocheck
import { assert } from 'chai';
import { squery } from '../src/index';

describe('/match', () => {
    it('simple query (name=value)', () => {
        let filter = squery('(name=value)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'value1',
            }),
            false
        );
        assert.equal(
            filter.match({
                name1: 'value',
            }),
            false
        );
        assert.equal(
            filter.match({
                test: 'test',
            }),
            false
        );
    });

    it('match: all (*)', () => {
        let filter = squery('(*)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(filter.match({}), true);
        assert.equal(filter.match(), true);
    });
    it('match: present (name=*)', () => {
        let filter = squery('(name=*)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: '',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: false,
            }),
            true
        );
        assert.equal(
            filter.match({
                name: null,
            }),
            true
        );
        assert.equal(
            filter.match({
                name1: 'value',
            }),
            false
        );
    });
    it('match: present (name)', () => {
        let filter = squery('(name)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: '',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: false,
            }),
            true
        );
        assert.equal(
            filter.match({
                name: null,
            }),
            true
        );
        assert.equal(
            filter.match({
                name1: 'value',
            }),
            false
        );
    });
    it('match: substring (name=*value*)', () => {
        let filter = squery('(name=*value*)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'prevaluepost',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'valuepost',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'prevalue',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'test',
            }),
            false
        );
    });
    it('match: substring (name=value*)', () => {
        let filter = squery('(name=value*)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'valuepost',
            }),
            true
        );

        assert.equal(
            filter.match({
                name: 'prevaluepost',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: 'prevalue',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: 'test',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: '',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: null,
            }),
            false
        );
    });
    it('match: substring (name=*value)', () => {
        let filter = squery('(name=*value)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'prevalue',
            }),
            true
        );

        assert.equal(
            filter.match({
                name: 'valuepost',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: 'prevaluepost',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: 'test',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: '',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: null,
            }),
            false
        );
    });
    it('match: approx (name~=value)', () => {
        let filter = squery('(name~=value)');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'prevaluepost',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'valuepost',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'prevalue',
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 'test',
            }),
            false
        );
    });
    it('match: lte (name<=value)', () => {
        let filter = squery('(name<=3)');
        assert.equal(
            filter.match({
                name: 2,
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 3,
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 4,
            }),
            false
        );
    });
    it('match: gte (name>=value)', () => {
        let filter = squery('(name>=3)');
        assert.equal(
            filter.match({
                name: 4,
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 3,
            }),
            true
        );
        assert.equal(
            filter.match({
                name: 2,
            }),
            false
        );
    });
    it('match: not (!(name=value))', () => {
        let filter = squery('(!(name=value))');
        assert.equal(
            filter.match({
                name: 'value',
            }),
            false
        );
        assert.equal(
            filter.match({
                name: 'value1',
            }),
            true
        );
        assert.equal(
            filter.match({
                name1: 'value',
            }),
            true
        );
        assert.equal(
            filter.match({
                test: 'test',
            }),
            true
        );
    });
    it('match: and (&(name1=value1)(name2=value2))', () => {
        let filter = squery('(&(name1=value1)(name2=value2))');
        assert.equal(filter.match({}), false);
        assert.equal(
            filter.match({
                name1: 'value1',
            }),
            false
        );
        assert.equal(
            filter.match({
                name2: 'value2',
            }),
            false
        );
        assert.equal(
            filter.match({
                name1: 'value1',
                name2: 'value2',
            }),
            true
        );
    });
    it('match: and (|(name1=value1)(name2=value2))', () => {
        let filter = squery('(|(name1=value1)(name2=value2))');
        assert.equal(filter.match({}), false);
        assert.equal(
            filter.match({
                name1: 'value1',
            }),
            true,
            'One'
        );
        assert.equal(
            filter.match({
                name2: 'value2',
            }),
            true,
            'Two'
        );
        assert.equal(
            filter.match({
                name1: 'value1',
                name2: 'value2',
            }),
            true,
            'Three'
        );
    });

    let tags = {
        tags: ['tag1', 'tag1.1', 'tag3.1', 'tag3.2'],
    };
    it('tags exists (tags=tag)', () => {
        let filter = squery('(tags=tag)');
        assert.equal(filter.match(tags), false);
    });
    it('tags exists (tags=tag1)', () => {
        let filter = squery('(tags=tag1)');
        assert.equal(filter.match(tags), true);
    });
    it('tags not exists (tags=tag3)', () => {
        let filter = squery('(tags=tag3)');
        assert.equal(filter.match(tags), false);
    });
    it('tags exists (tags=~tag1)', () => {
        let filter = squery('(tags~=tag1)');
        assert.equal(filter.match(tags), true);
    });
    it('tags not exists (tags=~tag2)', () => {
        let filter = squery('(tags~=tag2)');
        assert.equal(filter.match(tags), false);
    });
    it('tags not exists (tags=~tag3)', () => {
        let filter = squery('(tags~=tag3)');
        assert.equal(filter.match(tags), true);
    });
});
