import DependencyManager from './dependency';
import ComponentsHandler from './component';


export default class ComponentsManager{
    constructor(ctx, bundle, metadata) {

        this.ctx = ctx;
        this.bundle = bundle;
        this.metadata = metadata;

        this._deps = [];
        this._handler = new ComponentsHandler(metadata);
        this._isActivate = false;
        this._registration = null;
    }

    _error(reason, ex) {
        console.error('Component "' + this.metadata.name + (this.metadata.name !== this.metadata.class ? '(' + this.metadata.class + ')' : '') + '" error: ' + reason, ex);
    }

    open() {

        this._handler.create().then(component => {
            this.component = component;
            let reference;
            for (let i = 0; i < this.metadata.references.length; i++) {
                reference = this.metadata.references[i];
                //console.log('Create cdi.DependencyManager(name=' + reference.name + ') for component: ' + this.metadata.name + '[' + this.metadata.class + ']');
                this._deps.push(new DependencyManager(this.ctx, this, reference));
            }
            if (this._deps.length === 0 || this.metadata.immediate) {
                this.toggle(true);
            }
            this._checkDependency();
            for (let i = 0; i < this._deps.length; i++) {
                this._deps[i].open();
                this._checkDependency();
            }
        });

    }
    close() {
        for (let i = 0; i < this._deps.length; i++) {
            this._deps[i].close();
        }
        this._deps = [];
        this.toggle(false);
        this._handler.dispose();

    }
    isSatisfied() {
        for (let i = 0; i < this._deps.length; i++) {
            if (!this._deps[i].isSatisfied()) {
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
                    this._handler.activate(this.bundle.ctx);
                } catch (e) {
                    this._error('component.activate()', e);
                }
                if(this.metadata.interfaces){
                    this._registration = this.ctx.services.register(this.metadata.interfaces, this.component, this.metadata.properties);
                }
            }
        } else {
            if (this._isActivate) {
                this._isActivate = false;
                try {
                    this._handler.deactivate(this.bundle.ctx);
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

    assignHandler(name, service) {
        this._handler.set(name, service);
        this._checkDependency();
    }

    unassignHandler(name) {
        this._checkDependency();
        this._handler.set(name, null);
    }

    bindHandler(name, reference, service) {
        try {
            this._handler.invoke(name, reference, service);
            this._checkDependency();
        } catch (e) {
            this._error('component.bindHandler(' + name + ')', e);
        }
    }

    unbindHandler(name, reference, service) {
        this._checkDependency();
        try {
            this._handler.invoke(name, reference, service);
        } catch (e) {
            this._error('component.unbindHandler(' + name + ')', e);
        }
    }

}
