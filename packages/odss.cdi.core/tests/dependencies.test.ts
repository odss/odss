import { OptionalCardinality } from '../src/dependencies';
import { EmptyComponent, ExampleComponent } from './_res/components';

QUnit.module('@odss/cdi.core/metadata', () => {

    QUnit.test('MetadataScanner.findComponents()', assert => {
        const components = OptionalCardinality();
        assert.equal(components.length, 2);
    });

});