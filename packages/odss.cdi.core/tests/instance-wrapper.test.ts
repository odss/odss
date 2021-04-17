import { assert } from 'chai';

import { Component } from '../src/component';

describe('@odss/cdi.core/instance-wrapper', () => {
    const ARGS = [];
    beforeEach(() => {
        ARGS.length = 0;
    });

    class TextComponent {
        constructor(...args) {
            ARGS.push({
                name: 'constructor',
                args,
            });
        }
        add(...args) {
            ARGS.push({
                name: 'add',
                args,
            });
        }
    }
    it('create()', () => {
        const wrapper = new Component(TextComponent);
        assert.notOk(wrapper.isCreated());
        wrapper.create([1, 2, 3, 4]);
        assert.isOk(wrapper.isCreated());
        const expected = [
            {
                name: 'constructor',
                args: [1, 2, 3, 4],
            },
        ];
        assert.deepEqual(ARGS, expected);
    });
    it('set(name, value)', () => {
        const wrapper = new Component(TextComponent);
        assert.notOk(wrapper.isCreated());
        const instance = wrapper.create();
        wrapper.set('name', 'value');
        assert.equal(instance.name, 'value');
        assert.throws(() => {
            instance.name = 'test';
        });
    });
    it('invoke(name, [args])', () => {
        const wrapper = new Component(TextComponent);

        assert.notOk(wrapper.isCreated());
        wrapper.create();

        assert.ok(wrapper.isCreated());

        wrapper.invoke('add', [1, 2, 3]);
        wrapper.invoke('add', [2, 3, 4]);

        const expected = [
            {
                name: 'constructor',
                args: [],
            },
            {
                name: 'add',
                args: [1, 2, 3],
            },
            {
                name: 'add',
                args: [2, 3, 4],
            },
        ];
        assert.deepEqual(ARGS, expected);
    });
});
