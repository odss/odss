import { assert } from 'chai';
import { squery } from '../src/index';

describe('/filter', () => {
    let ITEMS = [
        {
            name: 'Jon',
            surname: 'Snow',
            age: 21,
            sex: 'man',
        },
        {
            name: 'Eddard',
            surname: 'Stark',
            age: 50,
            sex: 'man',
        },
        {
            name: 'Sansa',
            surname: 'Stark',
            age: 19,
            sex: 'woman',
        },
        {
            name: 'Tyrion',
            surname: 'Lannister',
            age: 31,
            sex: 'man',
        },
        {
            name: 'Daenerys',
            surname: 'Targaryen',
            age: 24,
            sex: 'woman',
        },
    ];
    const filter = query => {
        const matcher = squery(query);
        return ITEMS.filter(params => matcher.match(params));
    };

    it('catch all', () => {
        assert.ok(filter('*').length === 5, '(*)');
    });
    it('age <= 30', () => {
        let young = filter('age<=30');
        assert.equal(young.length, 3);
        assert.equal(young[0].name, 'Jon');
        assert.equal(young[1].name, 'Sansa');
        assert.equal(young[2].name, 'Daenerys');
    });
    it('Stark family', () => {
        let stark = filter('|(surname=Stark)(&(name=Jon)(surname=Snow))');
        assert.equal(stark.length, 3);
        assert.equal(stark[0].name, 'Jon');
        assert.equal(stark[1].name, 'Eddard');
        assert.equal(stark[2].name, 'Sansa');
    });
    it('no Stark name', () => {
        assert.equal(filter('!(surname=Stark)').length, 3, '(!(name~=Stark))');
    });
    it('Stark childs - string query', () => {
        assert.equal(filter('|(name=Jon)(name=Sansa)').length, 2);
    });
    it('Stark - Jon and Sansa - object query', () => {
        assert.equal(filter({ name: ['Jon', 'Sansa'] }).length, 2);
    });
    it('Stark and man - string query', () => {
        assert.equal(filter('&(sex=man)(surname=Stark)').length, 1);
    });
    it('Stark and man - object query', () => {
        assert.equal(filter({ sex: 'man', surname: 'Stark' }).length, 1);
    });
});
