import { Inject, Validate, Invalidate } from '../src/index';
import { MetadataKeys } from '../src/consts';


QUnit.module("@odss/cdi::Inject()", () => {
    const IService: string = 'pack.one.IService';
    interface IService {
        push():void ;
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
            Test
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
            ) {
                console.log('a')
            }
        }

        const params = Reflect.getMetadata(
            MetadataKeys.CONSTRUCTOR_DEPENDENCY,
            Test,
        );
        const expected = [{
            "index": 3,
            "type": "pack.one.IService"
        }, {
            "index": 2,
            "type": "method"
        }, {
            "index": 1,
            "type": "param2"
        }, {
            "index": 0,
            "type": "param1"
        }];
        assert.deepEqual(params, expected);
    });

});

QUnit.module("@odss/cdi validate and invalidate", () => {

    QUnit.test('class methods', assert => {
        class Test {
            @Validate
            valid() {

            }
            @Invalidate
            invalid() {

            }
        }
        const validMeta = Reflect.getMetadata(
            MetadataKeys.VALIDATE_METHOD,
            Test,
        );
        assert.deepEqual(validMeta, { name: 'valid' });

        const invalidMeta = Reflect.getMetadata(
            MetadataKeys.INVALIDATE_METHOD,
            Test,
        );
        assert.deepEqual(invalidMeta, { name: 'invalid' });
    });
});
