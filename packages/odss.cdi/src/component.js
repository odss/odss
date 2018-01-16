/**
 * Wrapper for this.component
 */
export default class ComponentsHandler{
    constructor(metadata) {
        this.metadata = metadata;
        this.component = null;
        this.methods = [];
    }
    /**
     * Create and validate object
     *
     * @throw Error
     */
    create() {
        let ComponentClass;
        let type = typeof this.metadata.class;
        if(type === 'string'){
            let parts = this.metadata.class.split(':');
            let className = parts[1];
            let location = parts[0];
            return System.import(location).then(m => {
                try {
                    ComponentClass = m[className];
                } catch (e) {
                    throw this._createError('Not found definition.', e);
                }
                if (typeof ComponentClass !== 'function') {
                    throw this._createError('Constructor is not function.');
                }
                return this._create(ComponentClass);
            });
        }
        if(type === 'function'){
            return Promise.resolve(this._create(this.metadata.class));
        }
        throw this._createError('Not found definition.');
    }
    _create(ComponentClass){
        try {
            this.component = new ComponentClass();
        } catch (e) {
            throw this._createError('Problem with creating object.', e);
        }

        if (typeof this.component[this.metadata.activate] !== 'function') {
            throw this._createError('Not found activate method: ' + this.metadata.activate);
        }
        if (typeof this.component[this.metadata.deactivate] !== 'function') {
            throw this._createError('Not found deactivate method: ' + this.metadata.deactivate);
        }

        let references = this.metadata.references;
        for (let i = 0; i < references.length; i++) {
            let reference = references[i];
            if (reference.bind !== null) {
                if (typeof this.component[reference.bind] !== 'function') {
                    throw this._createError('Not found bind method: ' + reference.bind);
                }
                if (reference.bind === this.metadata.activate) {
                    throw this._createError('Method bind has activator name: ' + reference.bind);
                }
                if (reference.bind === this.metadata.deactivate) {
                    throw this._createError('Method bind has deactivator name: ' + reference.bind);
                }
                include(this.methods, reference.bind);
            }
            if (reference.unbind !== null) {
                if (typeof this.component[reference.unbind] !== 'function') {
                    throw this._createError('Not found unbind method: ' + reference.unbind);
                }
                if (reference.unbind === this.metadata.activate) {
                    throw this._createError('Method unbind has activator name: ' + reference.unbind);
                }
                if (reference.unbind === this.metadata.deactivate) {
                    throw this._createError('Method unbind has deactivator name: ' + reference.unbind);
                }
                include(this.methods, reference.unbind);
            }
        }
        return this.component;
    }

    /**
     * Dispose created object
     */
    dispose() {
        console.log('dispose', this.methods);
        this.component = null;
        this.methods = [];
    }

    /**
     * @param {String} name
     * @param {Object} reference
     * @return {Object}
     * @throw Error
     */
    invoke(name, reference, service) {
        if (this.component === null) {
            throw this._error('Not created object before invoke method.');
        }
        if (typeof this.component[name] !== 'function') {
            throw this._error('Incorect invoked method: ' + name);
        }
        if (this.methods.indexOf(name) === -1) {
            throw this._error('Not defined invoked method: ' + name);
        }
        //console.debug('cdi.HandlerComponet::invoke('+name+', service)',service);
        return this.component[name](reference, service);
    }

    /**
     * @param {String} name
     * @param {Object} service
     * @throw Error
     */
    set(name, service) {
        if (this.component === null) {
            throw this._error('Not created object before set letiable.');
        }
        //console.debug('cdi.HandlerComponet::set('+name+', service)',service);
        //@TODO use methods
        Object.defineProperty(this.component, name, {
            value: service
        });
        // this.component[name] = service;
    }

    /**
     * @param {String} name
     * @return {Object}
     * @throw Error
     */
    get(name) {
        if (this.component === null) {
            throw this._error('Not created object before get letiable.');
        }
        //@TODO use methods
        return this.component[name] || null;
    }

    activate(ctx) {
        if (this.component === null) {
            throw this._error('Not created object before invoke activate method: ' + this.metadata.activate);
        }
        //console.debug('cdi.HandlerComponent::activate()');
        return this.component[this.metadata.activate](ctx);
    }

    deactivate(ctx) {
        if (this.component === null) {
            throw this._error('Not created object before invoke deactivate method: ' + this.metadata.deactivate);
        }
        // console.debug('cdi.HandlerComponent::deactivate()');
        return this.component[this.metadata.deactivate](ctx);
    }

    _error(reason, ex) {
        let name = this.metadata.name !== this.metadata.class ? this.metadata.name + '(' + (this.metadata.class) + ')' : this.metadata.name;
        return new Error('Some problem with this.component "' + name + '". ' + reason + ' (' + ex + ')', ex);
    }

    _createError(reason, ex) {
        this.component = null;
        this.methods = [];
        let name = this.metadata.name !== this.metadata.class ? this.metadata.name + '(' + (this.metadata.class) + ')' : this.metadata.name;
        return new Error('Can\'t create this.component "' + name + '". ' + reason + ' (' + ex + ')', ex);
    }

}


function include(arr, item){
    if(arr.indexOf(item) === -1){
        arr.push(item);
    }
}
