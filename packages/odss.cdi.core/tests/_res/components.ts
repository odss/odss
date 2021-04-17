import { IBundleContext } from '@odss/common';
import { Component, Inject, Validate, Invalidate, Bind, Unbind } from '@odss/cdi-decorators';

export const A = 1;
export const B = false;
export const C = 'test';

export function test() {}

export class Param1 {}

export class Param2 {}

export class Service1 {}

export class Service2 {}

export class Service3 {}

@Component()
export class EmptyComponent {}

@Component()
export class ExampleComponent {
    @Inject()
    public param1: Param1;

    private param2: Param2;

    constructor(service1: Service1, service2: Service2) {}

    @Validate()
    validate(ctx: IBundleContext) {}

    @Invalidate()
    invalidate(ctx: IBundleContext) {}

    @Bind()
    addService(service3: Service3) {}

    @Unbind()
    removeService(service3: Service3) {}
}
