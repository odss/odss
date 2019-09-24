/**
 * Wrapper for this.component
 */
export default class ComponentsWrapper {
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
    async create(dependencies=[]) {
        if(this.component){
            return;
        }
        let ComponentClass;
        let type = typeof this.metadata.specifications;
        if(type === 'string'){
            let parts = this.metadata.specifications.split(':');
            let className = parts[1];
            let location = parts[0];
            let m = await System.import(location);
            try {
                ComponentClass = m[className];
            } catch (e) {
                throw this._createError('Not found definition.', e);
            }
            if (typeof ComponentClass !== 'function') {
                throw this._createError('Constructor is not function.');
            }
            return this._create(ComponentClass, dependencies);
        }
        if(type === 'function'){
            return this._create(this.metadata.specifications, dependencies);
        }
        throw this._createError('Not found definition.');
    }
    _create(ComponentClass, dependencies){
        try {
            this.component = new ComponentClass(...dependencies);
        } catch (e) {
            throw this._createError('Problem with creating object.', e);
        }

        // if (typeof this.component[this.metadata.activate] !== 'function') {
            // throw this._createError('Not found activate method: ' + this.metadata.activate);
        // }
        // if (typeof this.component[this.metadata.deactivate] !== 'function') {
            // throw this._createError('Not found deactivate method: ' + this.metadata.deactivate);
        // }

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
    invoke(name, service, reference) {
        if (this.component === null) {
            throw this._error('Not created object before invoke method.');
        }
        if (typeof this.component[name] !== 'function') {
            throw this._error('Incorrect invoked method: ' + name);
        }
        if (this.methods.indexOf(name) === -1) {
            throw this._error('Not defined invoked method: ' + name);
        }
        //console.debug('cdi.HandlerComponet::invoke('+name+', service)',service);
        return this.component[name](service, reference);
    }

    /**
     * @param {String} name
     * @param {Object} service
     * @throw Error
     */
    set(name, value) {
        if (this.component === null) {
            throw this._error('Not created object before set value.');
        }
        //console.debug('cdi.HandlerComponet::set('+name+', value)',value);
        //@TODO use methods
        Object.defineProperty(this.component, name, {
            value
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
            throw this._error('Not created object before get value.');
        }
        //@TODO use methods
        return this.component[name] || null;
    }

    activate(ctx) {
        if (this.component === null) {
            throw this._error('Not created object before invoke activate method: ' + this.metadata.activate);
        }
        //console.debug('cdi.HandlerComponent::activate()');
        if(this.component[this.metadata.activate]){
            return this.component[this.metadata.activate](ctx);

        }
    }

    deactivate(ctx) {
        if (this.component === null) {
            throw this._error('Not created object before invoke deactivate method: ' + this.metadata.deactivate);
        }
        // console.debug('cdi.HandlerComponent::deactivate()');
        if(this.component[this.metadata.deactivate]){
            return this.component[this.metadata.deactivate](ctx);
        }
    }

    _error(reason, ex) {
        let name = this.metadata.name !== this.metadata.specifications ? this.metadata.name + '(' + (this.metadata.specifications) + ')' : this.metadata.name;
        return new Error('Some problem with this.component "' + name + '". ' + reason + ' (' + ex + ')', ex);
    }

    _createError(reason, ex) {
        this.component = null;
        this.methods = [];
        let name = this.metadata.name !== this.metadata.specifications ? this.metadata.name + '(' + (this.metadata.specifications) + ')' : this.metadata.name;
        return new Error(`Can\'t create component ${name}. ${reason} (${ex})`, ex);
    }

}


function include(arr, item){
    if(arr.indexOf(item) === -1){
        arr.push(item);
    }
}
