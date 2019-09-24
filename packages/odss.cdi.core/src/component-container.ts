import { IBundle } from '@odss/common';

import { InstanceWrapper } from './instance-wrapper';
import { ComponentDependencies } from './component-dependencies';

export class ComponentContainer {
    private isActive: boolean = false;
    private dependencies: ComponentDependencies;

    constructor(
        private bundle: IBundle,
        private instanceWrapper: InstanceWrapper,
    ) {
        this.dependencies = new ComponentDependencies(bundle, instanceWrapper)
    }
    open() {
        this.dependencies.open();
        this.checkDependency();
    }
    close() {
        this.dependencies.close();
    }
    modify() { }
    private activate() {
        if (this.isActive) {
            return;
        }
        if (!this.instanceWrapper.isCreated()) {
            this.instanceWrapper.create(this.dependencies.getConstructors());
        }
        for( const { key, service } of this.dependencies.getParams()) {
            this.instanceWrapper.set(key, service);
        }
        const { validate } = this.instanceWrapper.metatada;
        if (validate) {
            try {
                this.instanceWrapper.invoke(validate, this.bundle.context);
            } catch (e) {
                console.error(e);
            }
        }
        this.dependencies.activate();

        this.isActive = true;
    }
    private deactivate() {
        if (this.isActive) {
            this.isActive = true;
            this.dependencies.deactivate();

            const { invalidate } = this.instanceWrapper.metatada;
            if (invalidate) {
                try {
                    this.instanceWrapper.invoke(invalidate, this.bundle.context);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    private checkDependency(): void {
        this.toggle(this.dependencies.isSatisfied());
    }
    private toggle(state: boolean): void {
        if (state) {
            this.activate();
        } else {
            this.deactivate();
        }
    }
}