import { assert } from 'chai';

import { Metadata } from '../src/metadata';

describe('Metadata', () => {
    describe('set()/get()/has()', () => {
        it('should set and get value', () => {
            class Test {}
            const meta = Metadata.target(Test);
            meta.set('foo', 'bar');
            assert.isTrue(meta.has('foo'));
            assert.isFalse(meta.has('bar'));
            assert.equal(meta.get('foo'), 'bar');
        });
    });
    describe('setDefault()', () => {
        it('should create list value', () => {
            class Test {}
            const meta = Metadata.target(Test);
            meta.setDefaults('foo', []).push('bar');
            assert.isTrue(meta.has('foo'));
            assert.isFalse(meta.has('bar'));
            assert.deepEqual(meta.get('foo'), ['bar']);
        });
        it('should create object value', () => {
            class Test {}
            const meta = Metadata.target(Test);
            meta.setDefaults('foo', {})['bar'] = true;
            assert.isTrue(meta.has('foo'));
            assert.isFalse(meta.has('bar'));
            assert.deepEqual(meta.get('foo'), { bar: true });
        });
    });

    class Animal {
        name: string = '';
        constructor() {}
        animal1() {}
        animal2() {}
        get valget1() {
            return '';
        }
        set valset2(val) {}
    }
    class Dog extends Animal {
        nick: string = '';
        constructor() {
            super();
        }
        dog1() {}
        dog2() {}
        get valget3() {
            return '';
        }
        set valset4(val) {}
    }
    describe('::scan()', () => {
        it('should find all methods', () => {
            const names = Metadata.scan<Dog, string>(new Dog(), null, name => name);
            assert.deepEqual(names, ['dog1', 'dog2', 'animal1', 'animal2']);
        });
    });

    describe('::scanByKey()', () => {
        function decorArray(name: string) {
            return (
                target: any,
                key: string | symbol,
                descriptor: TypedPropertyDescriptor<any>
            ) => {
                Reflect.defineMetadata('__decor__', [name], target, key);
            };
        }

        function decorObject(name: string) {
            return (
                target: any,
                key: string | symbol,
                descriptor: TypedPropertyDescriptor<any>
            ) => {
                Reflect.defineMetadata('__decor__', { name }, target, key);
            };
        }


        class Test {
            @decorArray('value1')
            method1() {}

            @decorObject('value2')
            method2() {}
        }

        it('should find all methods', () => {
            const test = new Test();
            debugger;
            const info = Metadata.scanByKey<Test, string[]>(test, null, '__decor__');
            assert.deepEqual(info, [
                { name: 'method1', handler: test.method1, metadata: ['value1'] },
                { name: 'method2', handler: test.method2, metadata: { name: 'value2' } },
            ]);
        });
    });
});
