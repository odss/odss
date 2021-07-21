import {
    IFactoryContext,
    IHandler,
    IHandlerFactory,
    HandlerTypes,
} from '@odss/common';

import { BaseHandler } from './base';
import {
    ConstructorDependency,
    ParamDependency,
    ReferenceDependency,
} from './dependencies-trackers';

export class DependenciesHandlerFactory implements IHandlerFactory {
    getHandlers(factoryContext: IFactoryContext): IHandler[] {
        const construct = factoryContext.get(HandlerTypes.CONSTRUCTOR_DEPENDENCY) || [];
        const props = factoryContext.get(HandlerTypes.PROPERTIES_DEPENDENCY) || [];
        return [new DependenciesHandler(construct, props)];
    }
}

class DependenciesHandler extends BaseHandler {
    private constructors: ConstructorDependency[] = [];
    private params: ParamDependency[] = [];
    private references: ReferenceDependency[] = [];

    constructor(private construct: any, private props: any) {
        super();
    }

    async open() {
        const context = this.container.getBundleContext();
        this.constructors = this.construct.map(
            config => new ConstructorDependency(context, config, () => this.check())
        );
        this.params = this.props.map(
            config => new ParamDependency(context, config, () => this.check())
        );
        await Promise.all(this.constructors.map(dep => dep.open()));
        await Promise.all(this.params.map(dep => dep.open()));
        await this.check();
    }
    async check() {
        if (this.isSatisfied()) {
            const component = this.container.getComponent();
            if (!component.isCreated()) {
                component.create(this.getConstructors());
                for (const { key, service } of this.getParams()) {
                    component.set(key, service);
                }
            }
            await this.container.checkLifecycle();
        }
    }
    getConstructors() {
        return this.constructors.map(({ service }) => service);
    }
    getParams() {
        return this.params.map(({ key, service }) => ({
            key,
            service,
        }));
    }
    async close() {
        await Promise.all(this.constructors.map(dep => dep.close()));
        await Promise.all(this.params.map(dep => dep.close()));
    }
    isValid() {
        return this.isSatisfied();
    }
    isSatisfied(): boolean {
        const constructors = this.constructors.every(dep => dep.isSatisfied());
        const params = this.params.every(dep => dep.isSatisfied());
        return constructors && params;
    }
}
