import {
    IFactoryContext,
    IHandler,
    IHandlerFactory,
    HandlerTypes,
} from '@odss/cdi-common';

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

    open() {
        const context = this.container.getBundleContext();
        this.constructors = this.construct.map(
            config => new ConstructorDependency(context, config, () => this.check())
        );
        this.params = this.props.map(
            config => new ParamDependency(context, config, () => this.check())
        );
        this.constructors.forEach(dep => dep.open());
        this.params.forEach(dep => dep.open());
        this.check();
    }
    check() {
        if (this.isSatisfied()) {
            const component = this.container.getComponent();
            if (!component.isCreated()) {
                component.create(this.getConstructors());
                for (const { key, service } of this.getParams()) {
                    component.set(key, service);
                }
            }
            this.container.checkLifecycle();
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
    close() {
        this.constructors.forEach(dep => dep.close());
        this.params.forEach(dep => dep.close());
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
