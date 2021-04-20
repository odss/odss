import { IBundle, IBundleContext } from '@odss/common';
import {
    getFactoryContext,
    IFactoryContext,
    IHandlerFactory,
    IHandler,
    IComponent,
    IComponentContainer,
} from '@odss/cdi-common';

import { Component } from './component';

class ComponentContainer implements IComponentContainer {
    public context: IFactoryContext = null;
    private component: Component = null;
    private handlers: IHandler[] = [];
    private isActive: boolean = false;
    private isOpen: boolean = false;

    constructor(private bundle: IBundle, target: any) {
        this.component = new Component(target);
    }
    getBundleContext(): IBundleContext {
        return this.getBundle().context;
    }
    getComponent(): IComponent {
        return this.component;
    }
    getBundle(): IBundle {
        return this.bundle;
    }
    getTarget(): any {
        return this.component.target;
    }
    addHandlers(handlers: IHandler[]) {
        this.handlers.push(...handlers);
        for (const handler of this.handlers) {
            handler.setup(this);
            if (this.isOpen) {
                handler.open();
            }
        }
    }
    open() {
        this.isOpen = true;
        for (const handler of this.handlers) {
            handler.open();
        }
        this.checkLifecycle();
    }
    checkLifecycle() {
        const status = this.handlers.every(handler => handler.isValid());
        if (status && !this.isActive) {
            this.validate();
        } else if (!status && this.isActive) {
            this.invalidate();
        }
    }
    validate() {
        this.isActive = true;
        for (const handler of this.handlers) {
            handler.preValidate();
        }
        for (const handler of this.handlers) {
            handler.validate();
        }
        for (const handler of this.handlers) {
            handler.postValidate();
        }
    }
    invalidate() {
        for (const handler of this.handlers) {
            handler.preInvalidate();
        }
        for (const handler of this.handlers) {
            handler.invalidate();
        }
        for (const handler of this.handlers) {
            handler.postInvalidate();
        }
        this.isActive = false;
    }
    dispose() {
        this.isOpen = false;
        for (const handler of this.handlers) {
            handler.close();
        }
        this.bundle = null;
        this.context = null;
        this.component = null;
        this.handlers = null;
    }
}

class BundleContainer {
    private components: Set<ComponentContainer> = new Set();

    constructor(private bundle: IBundle) {}
    getBundle(): IBundle {
        return this.bundle;
    }
    addComponent(component: ComponentContainer) {
        this.components.add(component);
    }
    getComponents(): ComponentContainer[] {
        return [...this.components.values()];
    }
    open() {
        for (const component of this.components) {
            component.open();
        }
    }
    close() {
        for (const component of this.components) {
            component.dispose();
        }
    }
}

export class CdiService {
    private handlers: Set<IHandlerFactory> = new Set();
    private bundles: Map<IBundle, BundleContainer> = new Map();

    addBundleComponents(bundle: IBundle, targets: any[]) {
        console.log('addBundleComponents', bundle.name, targets);
        if (!this.bundles.has(bundle)) {
            this.bundles.set(bundle, new BundleContainer(bundle));
        }
        const container = this.bundles.get(bundle);
        for (const targrt of targets) {
            this.prepareBundleComponent(container, targrt);
        }
        container.open();
    }
    prepareBundleComponent(container: BundleContainer, target: any) {
        const context = getFactoryContext(target);
        const component = new ComponentContainer(container.getBundle(), target);
        for (const handlerFactory of this.handlers.values()) {
            component.addHandlers(handlerFactory.getHandlers(context));
        }
        container.addComponent(component);
    }
    removeBundleComponents(bundle: IBundle) {
        console.log('removeBundleComponents', bundle.name);
        if (this.bundles.has(bundle)) {
            this.bundles.get(bundle).close();
            this.bundles.delete(bundle);
        }
    }
    registerHandler(handlerFactory: IHandlerFactory) {
        this.handlers.add(handlerFactory);
        for (const containers of this.bundles.values()) {
            for (const component of containers.getComponents()) {
                component.addHandlers(handlerFactory.getHandlers(component.getTarget()));
            }
        }
    }
    unregisterHandler(handlerFactory: IHandlerFactory) {
        this.handlers.delete(handlerFactory);
    }
}
