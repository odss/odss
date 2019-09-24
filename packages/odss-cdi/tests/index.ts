import {
    Component,
    Inject,
    Validate,
    Invalidate,
    Requires,
    Bind,
    Unbind,
    Modified,
    Update,
} from '../src/index';
import { MetadataKeys } from '../src/consts';

QUnit.module('@odss/cdi::Inject()', () => {

    const IService: string = 'pack.one.IService';
    interface IService {
        push(): void;
    }

    QUnit.test('props', assert => {

        const someMethod = () => ({});

        class Test {
            @Inject()
            prop1: number;

            @Inject('prop2')
            prop2: number;

            @Inject(someMethod)
            prop3: string;

            @Inject(IService)
            prop4: IService;
        }

        const expected = [{
            key: 'prop1',
            type: 'Number',
        }, {
            key: 'prop2',
            type: 'prop2',
        }, {
            key: 'prop3',
            type: 'someMethod',
        }, {
            key: 'prop4',
            type: 'pack.one.IService',
        }];

        const properties = Reflect.getMetadata(
            MetadataKeys.PROPERTIES_DEPENDENCY,
            Test,
        );

        assert.deepEqual(properties, expected);
    });

    QUnit.test('params', assert => {

        const method = () => ({});

        class Test {
            constructor(
              @Inject('param1') private param1,
              @Inject('param2') private param2,
              @Inject(method) private paramMethod,
              @Inject(IService) private paramService,
            ) { }
        }

        const params = Reflect.getMetadata(
            MetadataKeys.CONSTRUCTOR_DEPENDENCY,
            Test,
        );
        const expected = [{
            index: 3,
            type: 'pack.one.IService',
        }, {
            index: 2,
            type: 'method',
        }, {
            index: 1,
            type: 'param2',
        }, {
            index: 0,
            type: 'param1',
        }];
        assert.deepEqual(params, expected);
    });

});

QUnit.test('@odss/cdi:Validate()', assert => {

    class Test {
        @Validate()
        valid() {

        }
    }
    const validMeta = Reflect.getMetadata(
        MetadataKeys.VALIDATE_METHOD,
        Test,
    );
    assert.deepEqual(validMeta, { name: 'valid' });
});

QUnit.test('@odss/cdi:Invalidate()', assert => {

    class Test {
        @Invalidate()
        invalid() {

        }
    }

    const invalidMeta = Reflect.getMetadata(
        MetadataKeys.INVALIDATE_METHOD,
        Test,
    );
    assert.deepEqual(invalidMeta, { name: 'invalid' });
});

QUnit.module('@odss/cdi::Component()', () => {
    QUnit.test('default name', assert => {

        @Component()
        class Test {}

        const meta = Reflect.getMetadata(
            MetadataKeys.COMPONENT,
            Test,
        );
        assert.deepEqual(meta, { name: 'Test' });
    });
    QUnit.test('custom name', assert => {

        @Component('CustomTest')
        class Test {}

        const meta = Reflect.getMetadata(
            MetadataKeys.COMPONENT,
            Test,
        );
        assert.deepEqual(meta, { name: 'CustomTest' });
    });

    QUnit.test('detect constructor dependency', assert => {
        class A { }
        class B { }

        @Component('CustomTest')
        class Test {
            constructor(a: A, b: B) {

            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.CONSTRUCTOR_DEPENDENCY,
            Test,
        );
        const expected = [{
            index: 0,
            type: 'A',
        }, {
            index: 1,
            type: 'B',
        }];
        assert.deepEqual(meta, expected);
    });
});

QUnit.module('@odss/cdi::Requires()', () => {
    QUnit.test('without constructor', assert => {

        @Requires()
        class Test {}

        const meta = Reflect.getMetadata(
            MetadataKeys.CONSTRUCTOR_DEPENDENCY,
            Test,
        );
        assert.deepEqual(meta, []);
    });
    QUnit.test('with empty constructor', assert => {

        @Requires()
        class Test {
            constructor() {

            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.CONSTRUCTOR_DEPENDENCY,
            Test,
        );
        assert.deepEqual(meta, []);
    });
    QUnit.test('custom deps', assert => {
        class A { }
        class B { }
        @Requires(A, B)
        class Test {
            constructor(a: A, b: B) {

            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.CONSTRUCTOR_DEPENDENCY,
            Test,
        );
        const expected = [{
            index: 0,
            type: 'A',
        }, {
            index: 1,
            type: 'B',
        }];
        assert.deepEqual(meta, expected);
    });
});

QUnit.module('@odss/cdi::Bind()', () => {
    QUnit.test('auto read types', assert => {
        class A {}

        @Component()
        class Test {
            @Bind()
            add(a: A) {
            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.BIND_DEPENDENCY,
            Test,
        );
        const expected = [{
            key: 'add',
            type: 'A',
            cardinality: '0..n',
        }];
        assert.deepEqual(meta, expected);
    });

    QUnit.test('read custom types', assert => {
        class A {}

        @Component()
        class Test {
            @Bind('Aa', '1..1')
            add(a: A) {
            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.BIND_DEPENDENCY,
            Test,
        );
        const expected = [{
            key: 'add',
            type: 'Aa',
            cardinality: '1..1',
        }];
        assert.deepEqual(meta, expected);
    });
});

QUnit.module('@odss/cdi::Unbind()', () => {
    QUnit.test('auto read types', assert => {
        class A {}

        @Component()
        class Test {
            @Unbind()
            add(a: A) {
            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.UNBIND_DEPENDENCY,
            Test,
        );
        const expected = [{
            key: 'add',
            type: 'A',
        }];
        assert.deepEqual(meta, expected);
    });

    QUnit.test('read custom types', assert => {
        class A {}

        @Component()
        class Test {
            @Unbind('Aa')
            add(a: A) {
            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.UNBIND_DEPENDENCY,
            Test,
        );
        const expected = [{
            key: 'add',
            type: 'Aa',
        }];
        assert.deepEqual(meta, expected);
    });
});

QUnit.module('@odss/cdi::Modified()', () => {
    QUnit.test('auto read types', assert => {
        class A {}

        @Component()
        class Test {
            @Modified()
            update(a: A) {
            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.MODIFIED_DEPENDENCY,
            Test,
        );
        const expected = [{
            key: 'update',
            type: 'A',
        }];
        assert.deepEqual(meta, expected);
    });

    QUnit.test('read custom types', assert => {
        class A {}

        @Component()
        class Test {
            @Modified('Aa')
            update(a: A) {
            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.MODIFIED_DEPENDENCY,
            Test,
        );
        const expected = [{
            key: 'update',
            type: 'Aa',
        }];
        assert.deepEqual(meta, expected);
    });
});
QUnit.module('@odss/cdi::Update()', () => {
    QUnit.test('auto read types', assert => {
        class A {}

        @Component()
        class Test {
            @Update()
            update(props: object) {
            }
        }

        const meta = Reflect.getMetadata(
            MetadataKeys.UPDATE_DEPENDENCY,
            Test,
        );
        const expected = [{
            key: 'update',
        }];
        assert.deepEqual(meta, expected);
    });
});
