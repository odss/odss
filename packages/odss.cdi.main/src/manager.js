import {ReferenceDependency, RequireDependency} from './dependency';
import ComponentsWrapper from './component';


export default class ComponentsManager{
    constructor(ctx, bundle, metadata) {

        this.ctx = ctx;
        this.bundle = bundle;
        this.metadata = metadata;

        this._deps = [];
        this._requires = [];
        this._component = new ComponentsWrapper(metadata);
        this._isActivate = false;
        this._registration = null;
    }

    _error(reason, ex) {
        console.error('Component "' + this.metadata.name + (this.metadata.name !== this.metadata.specifications ? '(' + this.metadata.specifications + ')' : '') + '" error: ' + reason, ex);
    }

    async open() {
        if(!this.metadata.requires.length){
            await this._component.create();
        }
        for(let item of this.metadata.properties){
            let value = this.ctx.property(item.property, item.value);
            this._component.set(item.name, value);
        }

        let i = 0;
        for (let require of this.metadata.requires) {
            this._deps.push(new RequireDependency(this.ctx, this, require, i));
            i += 1;
        }
        for (let reference of this.metadata.references) {
            this._deps.push(new ReferenceDependency(this.ctx, this, reference));
        }
        await this._checkDependency();
        for (let dep of this._deps) {
            dep.open();
            await this._checkDependency();
        }
        // this._component.set
    }
    async close() {
        for (let dep of this._deps) {
            dep.close();
        }
        this._deps = [];
        await this.toggle(false);
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
    async activate(){
        if (this._isActivate) {
            return;
        }
        this._isActivate = true;
        if(this.metadata.requires.length){
            await this._component.create(this._requires);
        }
        try {
            await this._component.activate(this.bundle.context);
        } catch (e) {
            this._error('component.activate()', e);
        }
        if(this.metadata.provides.length){
            this._registration = this.ctx.registerService(
                this.metadata.provides,
                this._component.component
            );
        }
    }
    async deactivate(){
        if (!this._isActivate) {
            return;
        }
        if(this.metadata.requires.length){
            await this._component.dispose();
        }
        this._isActivate = false;
        try {
            await this._component.deactivate(this.bundle.context);
        } catch (e) {
            this._error('component.deactivate()', e);
        }
        if (this._registration) {
            this._registration.unregister();
            this._registration = null;
        }
    }
    async toggle(state) {
        if (state) {
            await this.activate();
        } else {
            await this.deactivate();
        }
    }

    async _checkDependency() {
        await this.toggle(this.isSatisfied());
    }

    assignHandler(position, value) {
        this._requires[position] = value;
        this._checkDependency();
    }

    unassignHandler(position) {
        this._checkDependency();
        this._requires[position] = null;
    }

    bindHandler(name, service, reference) {
        try {
            this._component.invoke(name, service, reference);
            this._checkDependency();
        } catch (e) {
            this._error('component.bindHandler(' + name + ')', e);
        }
    }

    unbindHandler(name, service, reference) {
        this._checkDependency();
        try {
            this._component.invoke(name, service, reference);
        } catch (e) {
            this._error('component.unbindHandler(' + name + ')', e);
        }
    }

}
