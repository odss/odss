import DependencyManager from './dependency';
import ComponentsWrapper from './component';


export default class ComponentsManager{
    constructor(ctx, bundle, metadata) {

        this.ctx = ctx;
        this.bundle = bundle;
        this.metadata = metadata;

        this._deps = [];
        this._component = new ComponentsWrapper(metadata);
        this._isActivate = false;
        this._registration = null;
    }

    _error(reason, ex) {
        console.error('Component "' + this.metadata.name + (this.metadata.name !== this.metadata.specifications ? '(' + this.metadata.specifications + ')' : '') + '" error: ' + reason, ex);
    }

    async open() {
        await this._component.create();
        for(let item of this.metadata.properties){
            let value = this.ctx.property(item.property, item.value);
            this._component.set(item.name, value);
        }
        for (let reference of this.metadata.references) {
            this._deps.push(new DependencyManager(this.ctx, this, reference));
        }
        if (this._deps.length === 0 || this.metadata.immediate) {
            this.toggle(true);
        }
        this._checkDependency();
        for (let dep of this._deps) {
            dep.open();
            this._checkDependency();
        }
        // this._component.set
    }
    close() {
        for (let dep of this._deps) {
            dep.close();
        }
        this._deps = [];
        this.toggle(false);
        this._component.dispose();

    }
    isSatisfied() {
        for (let dep of this._deps) {
            if (!dep.isSatisfied()) {
                return false;
            }
        }
        return true;
    }
    toggle(state) {
        if (state) {
            if (!this._isActivate) {
                this._isActivate = true;
                try {
                    this._component.activate(this.bundle.context);
                } catch (e) {
                    this._error('component.activate()', e);
                }
                if(this.metadata.interfaces){
                    this._registration = this.ctx.registerService(
                        this.metadata.interfaces,
                        this._component.component
                    );
                }
            }
        } else {
            if (this._isActivate) {
                this._isActivate = false;
                try {
                    this._component.deactivate(this.bundle.context);
                } catch (e) {
                    this._error('component.deactivate()', e);
                }
                if (this._registration) {
                    this._registration.unregister();
                    this._registration = null;
                }
            }
        }
    }

    _checkDependency() {
        this.toggle(this.isSatisfied());
    }

    assignHandler(name, value) {
        this._component.set(name, value);
        this._checkDependency();
    }

    unassignHandler(name) {
        this._checkDependency();
        this._component.set(name, null);
    }

    bindHandler(name, reference, service) {
        try {
            this._component.invoke(name, reference, service);
            this._checkDependency();
        } catch (e) {
            this._error('component.bindHandler(' + name + ')', e);
        }
    }

    unbindHandler(name, reference, service) {
        this._checkDependency();
        try {
            this._component.invoke(name, reference, service);
        } catch (e) {
            this._error('component.unbindHandler(' + name + ')', e);
        }
    }

}
