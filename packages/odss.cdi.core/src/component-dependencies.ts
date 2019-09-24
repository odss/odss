
import { IBundle } from '@odss/common';
import { ConstructorDependency, ParamDependency, ReferenceDependency } from './dependencies';
import { InstanceWrapper } from './instance-wrapper';

export class ComponentDependencies {

    private constructors: ConstructorDependency[] = [];
    private params: ParamDependency[] = []
    private references: ReferenceDependency[] = [];

    constructor(
        bundle: IBundle,
        instanceWrapper: InstanceWrapper,
    ) {
        const { dependencies: { self, params, references } } = instanceWrapper.metatada;
        this.constructors = self.map((config) => new ConstructorDependency(bundle.context, config));
        this.params = params.map(config => new ParamDependency(bundle.context, config));
        this.references = references.map((config) => new ReferenceDependency(instanceWrapper, bundle.context, config));
    }
    getConstructors() {
        return this.constructors.map(({ service }) => service);
    }
    getParams() {
        return this.params.map(({ key, service }) => ({
            key,
            service
        }));
    }
    open() {
        this.constructors.forEach(dep => dep.open());
        this.params.forEach(dep => dep.open());
    }
    close() {
        this.constructors.forEach(dep => dep.open());
        this.params.forEach(dep => dep.open());
    }
    activate() {
        this.references.forEach(dep => dep.open());
    }
    deactivate() {
        this.references.forEach(dep => dep.close());
    }
    isSatisfied(): boolean {
        const constructors = this.constructors.every(dep => dep.isSatisfied());
        const params = this.params.every(dep => dep.isSatisfied());
        return constructors && params;
    }
}