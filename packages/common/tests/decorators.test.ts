import { assert } from 'chai';
import { HandlerTypes, getFactoryContext } from '../src/index';
import {
    Component,
    Inject,
    Provides,
    Validate,
    Invalidate,
    Bind,
    Unbind,
    Modified,
    Update,
} from '../src/decorators';

describe('@Component()', () => {
    it('should create component metadata for empty name', () => {
        @Component()
        class Test {}
        assert.equal('Test', getFactoryContext(Test).name);
    });
    it('should create component metadata', () => {
        @Component('ComponentName')
        class Test {}
        assert.equal('ComponentName', getFactoryContext(Test).name);
    });
});

describe('@Inject()', () => {
    class Service {}
    function FuncService() {}
    const ArrowService = () => {};

    class Test {
        @Inject('foo', { key: 'value' })
        param1: string = '';

        @Inject()
        param2: string = '';

        @Inject(null, '(key=value)')
        param3: Service = '';

        constructor(
            @Inject('foo') arg1,
            @Inject('bar') arg2,
            @Inject(Service) arg3,
            @Inject(FuncService) arg4,
            @Inject(ArrowService) arg5
        ) {}
    }

    it('should create constructor metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.CONSTRUCTOR_DEPENDENCY);

        assert.deepEqual(info, [
            { index: 4, token: 'ArrowService', filter: null },
            { index: 3, token: 'FuncService', filter: null },
            { index: 2, token: 'Service', filter: null },
            { index: 1, token: 'bar', filter: null },
            { index: 0, token: 'foo', filter: null },
        ]);
    });
    it('should create params metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.PROPERTIES_DEPENDENCY);

        assert.deepEqual(info, [
            { key: 'param1', token: 'foo', filter: { key: 'value' } },
            { key: 'param2', token: 'String', filter: null },
            { key: 'param3', token: 'Service', filter: '(key=value)' },
        ]);
    });
});

describe('@Provides()', () => {
    describe('one token', () => {
        class Service {}

        @Provides(Service)
        class Test {}

        it('should create provide metadata', () => {
            const info = getFactoryContext(Test).get(HandlerTypes.PROVIDES);
            assert.deepEqual(info, [{ tokens: ['Service'], properties: {} }]);
        });
    });
    describe('many tokens', () => {
        class Service {}

        @Provides([Service, 'foo.bar.Service'])
        class Test {}

        it('should create provide metadata', () => {
            const info = getFactoryContext(Test).get(HandlerTypes.PROVIDES);
            assert.deepEqual(info, [{ tokens: ['Service', 'foo.bar.Service'], properties: {} }]);
        });
    });
    describe('with properties', () => {
        class Service {}

        @Provides([Service, 'foo.bar.Service'], { foo: 'bar' })
        class Test {}

        it('should create provide metadata', () => {
            const info = getFactoryContext(Test).get(HandlerTypes.PROVIDES);
            assert.deepEqual(info, [
                {
                    tokens: ['Service', 'foo.bar.Service'],
                    properties: { foo: 'bar' },
                },
            ]);
        });
    });
});

describe('@Validate()', () => {
    class Service {}

    class Test {
        @Validate()
        validateMethod() {}
    }

    it('should create validate metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.VALIDATE_METHOD);
        assert.deepEqual(info, { name: 'validateMethod' });
    });
});

describe('@Invalidate()', () => {
    class Test {
        @Invalidate()
        invalidateMethod() {}
    }

    it('should create invalidate metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.INVALIDATE_METHOD);
        assert.deepEqual(info, { name: 'invalidateMethod' });
    });
});

describe('@Bind()', () => {
    class Service {}

    class Test {
        @Bind()
        addService(service: Service) {}
    }

    it('should create bind metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.BIND_DEPENDENCY);
        assert.deepEqual(info, [{ key: 'addService', token: 'Service', cardinality: '0..n' }]);
    });
});

describe('@Unbind()', () => {
    class Service {}

    class Test {
        @Unbind()
        removeService(service: Service) {}
    }

    it('should create unbind metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.UNBIND_DEPENDENCY);
        assert.deepEqual(info, [{ key: 'removeService', token: 'Service' }]);
    });
});

describe('@Modified()', () => {
    class Service {}

    class Test {
        @Modified()
        modifiedMethod(service: Service) {}
    }

    it('should create modified metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.MODIFIED_DEPENDENCY);
        assert.deepEqual(info, [{ key: 'modifiedMethod', token: "Service" }]);
    });
});

describe('@Update()', () => {
    class Service {}

    class Test {
        @Update()
        updateMethod() {}
    }

    it('should create update metadata', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.UPDATE_DEPENDENCY);
        assert.deepEqual(info, { key: 'updateMethod' });
    });
});

describe('inherit', () => {
    class Service {}

    @Component()
    class Base {
        constructor(private service: Service) {}

        @Validate()
        validate() {}

        @Invalidate()
        invalidate() {}
    }
    class Test extends Base {}
    it('should create metadata for parent', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.CONSTRUCTOR_DEPENDENCY);
        assert.deepEqual(info, [{ index: 0, token: Service }]);
    });
    it('should take metadata validate', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.VALIDATE_METHOD);
        assert.deepEqual(info, { name: 'validate' });
    });
    it('should take metadata invalidate', () => {
        const info = getFactoryContext(Test).get(HandlerTypes.INVALIDATE_METHOD);
        assert.deepEqual(info, { name: 'invalidate' });
    });
});

describe('Complex', () => {
    class Service {}
    class Foo {}
    class Bar {}
    @Component('test')
    @Provides('foo.bar', { foo: 'bar' })
    class Test {
        constructor(private service: Service) {}

        @Validate()
        validate() {}

        @Invalidate()
        invalidate() {}

        @Bind()
        addServiceFoo(service: Foo) {}

        @Unbind()
        removeServiceFoo(service: Foo) {}

        @Bind()
        addServiceBar(service: Bar) {}

        @Unbind()
        removeServiceBar(service: Bar) {}
    }

    const ctx = getFactoryContext(Test);
    it('should take metadata for provider', () => {
        const info = ctx.get(HandlerTypes.PROVIDES);
        assert.deepEqual(info, [
            {
                tokens: ['foo.bar'],
                properties: {
                    foo: 'bar',
                },
            },
        ]);
    });
    it('should take constructor deps', () => {
        const info = ctx.get(HandlerTypes.CONSTRUCTOR_DEPENDENCY);
        assert.deepEqual(info, [{ index: 0, token: Service }]);
    });
    it('should take validate info', () => {
        const info = ctx.get(HandlerTypes.VALIDATE_METHOD);
        assert.deepEqual(info, { name: 'validate' });
    });

    it('should take invalidate info', () => {
        const info = ctx.get(HandlerTypes.INVALIDATE_METHOD);
        assert.deepEqual(info, { name: 'invalidate' });
    });
    // it('should take bind info', () => {
    //     const info = ctx.get(HandlerTypes.BIND_DEPENDENCY);
    //     assert.deepEqual(info, { key: "", token, cardinality });
    // });
});
