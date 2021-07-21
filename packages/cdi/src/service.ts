import { getLogger } from '@stool/logging';
import {
    IBundle,
    IBundleContext,
    getFactoryContext,
    IFactoryContext,
    IHandlerFactory,
    IHandler,
    IComponent,
    IComponentContainer,
} from '@odss/common';

import { Component } from './component';


const logger = getLogger('@odss/cdi.core');

enum Status {
    ACTIVED = 1,
    OPENED = 2,
    VERIFIED = 4,
}

class ComponentContainer implements IComponentContainer {
    public context: IFactoryContext = null;
    private component: Component = null;
    private handlers: IHandler[] = [];
    private isActive: boolean = false;
    private isOpen: boolean = false;

    private status: number = 0;

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
    async addHandlers(handlers: IHandler[]) {
        if (handlers.length) {
            this.handlers.push(...handlers);
            for (const handler of handlers) {
                await handler.setup(this);
                if (this.isOpen) {
                    await handler.open();
                }
            }
            if (this.isActive) {
                await this.validate(handlers);
            } else {
                this.checkLifecycle();
            }
        }
    }
    async removeHandlers(handlers: IHandler[]) {
        this.handlers = this.handlers.filter(h => !handlers.includes(h));
        for(const handler of handlers) {
            await handler.close();
        }
    }
    async open() {
        this.isOpen = true;
        for (const handler of this.handlers) {
            await handler.open();
        }
        await this.checkLifecycle();
    }
    async checkLifecycle() {
        if (this.handlers.length) {
            const status = this.handlers.every(handler => handler.isValid());
            if (status && !this.isActive) {
                this.isActive = true;
                await this.validate(this.handlers);
            } else if (!status && this.isActive) {
                await this.invalidate(this.handlers);
                this.isActive = false;
            }
        }
    }
    async validate(handlers: IHandler[]) {
        for (const handler of handlers) {
            await handler.preValidate();
        }
        for (const handler of handlers) {
            await handler.validate();
        }
        for (const handler of handlers) {
            await handler.postValidate();
        }
    }
    async invalidate(handlers: IHandler[]) {
        for (const handler of handlers) {
            await handler.preInvalidate();
        }
        for (const handler of handlers) {
            await handler.invalidate();
        }
        for (const handler of handlers) {
            await handler.postInvalidate();
        }
    }
    async dispose() {
        this.isOpen = false;
        for (const handler of this.handlers) {
            await handler.close();
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
    async open() {
        for (const component of this.components) {
            await component.open();
        }
    }
    async close() {
        for (const component of this.components) {
            await component.dispose();
        }
    }
}

export class CdiService {
    private handlers: Set<IHandlerFactory> = new Set();
    private bundles: Map<IBundle, BundleContainer> = new Map();

    async addBundleComponents(bundle: IBundle, targets: any[]) {
        if (!this.bundles.has(bundle)) {
            logger.debug(`Add bundle: ${bundle.name}`);
            this.bundles.set(bundle, new BundleContainer(bundle));
        }
        const container = this.bundles.get(bundle);
        for (const target of targets) {
            await this.prepareBundleComponent(container, target);
        }
        await container.open();
    }
    async prepareBundleComponent(container: BundleContainer, target: any) {
        const context = getFactoryContext(target);
        const component = new ComponentContainer(container.getBundle(), target);
        for (const handlerFactory of this.handlers.values()) {
            await component.addHandlers(handlerFactory.getHandlers(context));
        }
        container.addComponent(component);
    }
    async removeBundleComponents(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            logger.debug(`Remove bundle: ${bundle.name}`);
            await this.bundles.get(bundle).close();
            this.bundles.delete(bundle);
        }
    }
    async registerHandler(handlerFactory: IHandlerFactory) {
        logger.debug(`Register handlers factory: ${getName(handlerFactory)}`);
        this.handlers.add(handlerFactory);
        for (const containers of this.bundles.values()) {
            for (const component of containers.getComponents()) {
                const context = getFactoryContext(component.getTarget());
                const handlers = handlerFactory.getHandlers(context);
                await component.addHandlers(handlers);
            }
        }
    }
    async unregisterHandler(handlerFactory: IHandlerFactory) {
        logger.debug(`Unregister handlers factory: ${getName(handlerFactory)}`);
        this.handlers.delete(handlerFactory);
    }
}

const getName = (obj: any) => obj?.constructor?.name || '<Unknown>';