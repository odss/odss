import { MetadataScanner, Metadata } from '../src/metadata';
import * as componentsModule from './_res/components';
import { InstanceWrapper } from '../src/instance-wrapper';

QUnit.module('@odss/cdi.core/instance-wrapper', hooks => {
    const ARGS = [];
    hooks.beforeEach(() => {
        ARGS.length = 0;
    })

    class Component {
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
    const metadata = MetadataScanner.scan(Component);

    QUnit.test('invoke(name, ...args)', assert => {
        const wrapper = new InstanceWrapper(Component, metadata);

        assert.notOk(wrapper.isCreated())
        wrapper.create();

        assert.ok(wrapper.isCreated())

        wrapper.invoke('add', 1);
        wrapper.invoke('add', 2);

        const expected = [{
            name: 'constructor',
            args: [],
        },{
            name: 'add',
            args: [1],
        }, {
            name: 'add',
            args: [2],
        }];
        assert.deepEqual(ARGS, expected);
    });

});