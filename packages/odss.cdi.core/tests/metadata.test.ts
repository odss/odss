import { MetadataScanner, Metadata } from '../src/metadata';
import * as componentsModule from './_res/components';
import { EmptyComponent, ExampleComponent } from './_res/components';

QUnit.module('@odss/cdi.core/metadata', () => {

    QUnit.test('MetadataScanner.findComponents()', assert => {
        const components = MetadataScanner.findComponents(componentsModule);
        assert.equal(components.length, 2);
    });

    QUnit.test('MetadataScanner.scan(EmptyComponent)', assert => {
        const metadata = MetadataScanner.scan(EmptyComponent);
        const expected: Metadata = {
            name: "EmptyComponent",
            validate: '',
            invalidate: '',
            dependencies: {
                self: [],
                params: [],
                references: [],
            },
        };
        assert.deepEqual(metadata, expected);
    });

    QUnit.test('MetadataScanner.scan(ExampleComponent)', assert => {
        const metadata = MetadataScanner.scan(ExampleComponent);
        const expected: Metadata = {
            name: 'ExampleComponent',
            validate: 'validate',
            invalidate: 'invalidate',
            dependencies: {
                self: [{
                    index: 0,
                    type: "Service1"
                }, {
                    index: 1,
                    type: "Service2"
                }],
                params: [{
                    key: "param1",
                    type: "Param1"
                }],
                references: [{
                    type: "Service3",
                    cardinality: "0..n",
                    bind: "addService",
                    unbind: "removeService"
                }],
            },
        };
        assert.deepEqual(metadata, expected);
    });

});