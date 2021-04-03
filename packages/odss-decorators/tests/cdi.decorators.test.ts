import { assert } from 'chai';
import { HandlersContext, HandlerTypes } from '@odss/common';

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
} from '../src';

describe('@Component()', () => {
    it('should create component metadata for empty name', () => {
        @Component()
        class Test {}
        assert.equal('Test', HandlersContext.get(Test).name);
    });
    it('should create component metadata', () => {
        @Component('ComponentName')
        class Test {}
        assert.equal('ComponentName', HandlersContext.get(Test).name);
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
        const metadata = HandlersContext.get(Test).getHandler(
            HandlerTypes.CONSTRUCTOR_DEPENDENCY
        );

        assert.deepEqual(metadata, [
            { index: 4, type: 'ArrowService', filter: null },
            { index: 3, type: 'FuncService', filter: null },
            { index: 2, type: 'Service', filter: null },
            { index: 1, type: 'bar', filter: null },
            { index: 0, type: 'foo', filter: null },
        ]);
    });
    it('should create params metadata', () => {
        const metadata = HandlersContext.get(Test).getHandler(
            HandlerTypes.PROPERTIES_DEPENDENCY
        );

        assert.deepEqual(
            [
                { key: 'param1', type: 'foo', filter: { key: 'value' } },
                { key: 'param2', type: 'String', filter: null },
                { key: 'param3', type: 'Service', filter: '(key=value)' },
            ],
            metadata
        );
    });
});

describe('@Provides()', () => {
    describe('one token', () => {
        class Service {}

        @Provides(Service)
        class Test {}

        it('should create provide metadata', () => {
            const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.PROVIDES);
            assert.deepEqual([{ types: ['Service'], properties: {} }], metadata);
        });
    });
    describe('many tokens', () => {
        class Service {}

        @Provides([Service, 'foo.bar.Service'])
        class Test {}

        it('should create provide metadata', () => {
            const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.PROVIDES);
            assert.deepEqual([{ types: ['Service', 'foo.bar.Service'], properties: {} }], metadata);
        });
    });
    describe('with properties', () => {
        class Service {}

        @Provides([Service, 'foo.bar.Service'], { foo: 'bar' })
        class Test {}

        it('should create provide metadata', () => {
            const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.PROVIDES);
            assert.deepEqual(
                [
                    {
                        types: ['Service', 'foo.bar.Service'],
                        properties: { foo: 'bar' },
                    },
                ],
                metadata
            );
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
        const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.VALIDATE_METHOD);
        assert.deepEqual({ name: 'validateMethod' }, metadata);
    });
});

describe('@Invalidate()', () => {
    class Test {
        @Invalidate()
        invalidateMethod() {}
    }

    it('should create invalidate metadata', () => {
        const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.INVALIDATE_METHOD);
        assert.deepEqual({ name: 'invalidateMethod' }, metadata);
    });
});

describe('@Bind()', () => {
    class Service {}

    class Test {
        @Bind()
        addService(service: Service) {}
    }

    it('should create bind metadata', () => {
        const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.BIND_DEPENDENCY);
        assert.deepEqual([{ key: 'addService', type: 'Service', cardinality: '0..n' }], metadata);
    });
});

describe('@Unbind()', () => {
    class Service {}

    class Test {
        @Unbind()
        removeService(service: Service) {}
    }

    it('should create unbind metadata', () => {
        const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.UNBIND_DEPENDENCY);
        assert.deepEqual([{ key: 'removeService', type: 'Service' }], metadata);
    });
});

describe('@Modified()', () => {
    class Service {}

    class Test {
        @Modified()
        modifiedMethod(service: Service) {}
    }

    it('should create modified metadata', () => {
        const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.MODIFIED_DEPENDENCY);
        assert.deepEqual([{ key: 'modifiedMethod', type: 'Service' }], metadata);
    });
});

describe('@Update()', () => {
    class Service {}

    class Test {
        @Update()
        updateMethod() {}
    }

    it('should create update metadata', () => {
        const metadata = HandlersContext.get(Test).getHandler(HandlerTypes.UPDATE_DEPENDENCY);
        assert.deepEqual({ key: 'updateMethod' }, metadata);
    });
});

describe('extends', () => {
    class Service {}

    @Component()
    class Base {
        constructor(private service: Service) {}

        @Validate()
        validate() {}

        @Invalidate()
        invalidate() {}
    }
    class Test extends Base {

    }
    it('should create metadata for parent', () => {
        const ctx = HandlersContext.get(Test);

        assert.deepEqual(
            [{ index: 0, type: 'Service' }],
            ctx.getHandler(HandlerTypes.CONSTRUCTOR_DEPENDENCY)
        );

        assert.deepEqual({ name: 'validate' }, ctx.getHandler(HandlerTypes.VALIDATE_METHOD));
        assert.deepEqual(
            { name: 'invalidate' },
            ctx.getHandler(HandlerTypes.INVALIDATE_METHOD)
        );

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

    it('should create metadata for all handlers', () => {
        const ctx = HandlersContext.get(Test);
        assert.deepEqual(
            [
                {
                    types: ['foo.bar'],
                    properties: {
                        foo: 'bar',
                    },
                },
            ],
            ctx.getHandler(HandlerTypes.PROVIDES)
        );
        assert.deepEqual(
            [{ index: 0, type: 'Service' }],
            ctx.getHandler(HandlerTypes.CONSTRUCTOR_DEPENDENCY)
        );
        assert.deepEqual({ name: 'validate' }, ctx.getHandler(HandlerTypes.VALIDATE_METHOD));
        assert.deepEqual(
            { name: 'invalidate' },
            ctx.getHandler(HandlerTypes.INVALIDATE_METHOD)
        );

        assert.deepEqual(
            [
                {
                    cardinality: '0..n',
                    key: 'addServiceFoo',
                    type: 'Foo',
                },
                {
                    cardinality: '0..n',
                    key: 'addServiceBar',
                    type: 'Bar',
                },
            ],
            ctx.getHandler(HandlerTypes.BIND_DEPENDENCY)
        );
        assert.deepEqual(
            [
                {
                    key: 'removeServiceFoo',
                    type: 'Foo',
                },
                {
                    key: 'removeServiceBar',
                    type: 'Bar',
                },
            ],
            ctx.getHandler(HandlerTypes.UNBIND_DEPENDENCY)
        );
    });
});
