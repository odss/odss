/**
 * Candinality: 0..1
 */
class OptionalCardinality{
    constructor(dependency) {
        this._dependency = dependency;
        this._serviceCounter = 0;
        this._serviceId = null;
    }
    addingService(reference, service) {
        console.log('cdi.OptionalCardinality::addingService(reference)', reference);
        if (this._serviceId === null) {
            this._serviceId = reference.id;
            this._dependency.assignService(service);
        }
    }
    removedService(reference, service) {
        console.log('cdi.OptionalCardinality::removedService(reference)', reference);
        if (this._serviceId === reference.id) {
            this._serviceId = null;
            this._dependency.unassignService();
        }
    }
    isSatisfied() {
        return true;
    }
}

/**
 * Candinality: 1..1
 */
class MandatoryCardinality{

    constructor(dependency) {
        this._dependency = dependency;
        this._serviceId = null;
    }
    addingService(reference, service) {
        console.log('cdi.SingleCardinality::addingService(reference)', reference);
        if (this._serviceId === null) {
            this._serviceId = reference.id;
            this._dependency.assignService(service);
        }
    }
    removedService(reference, service) {
        console.log('cdi.SingleCardinality::removedService(reference)', reference);
        if (this._serviceId === reference.id) {
            this._serviceId = null;
            this._dependency.unassignService();
        }
    }
    isSatisfied() {
        return this._serviceId !== null;
    }
}
/**
 * Candinality: 0..n
 */
class MultipleCardinality{
    constructor(dependency) {
        this._dependency = dependency;
    }
    addingService(reference, service) {
        console.log('cdi.MultipleCardinality::addingService(reference)', reference);
        this._dependency.bindService(reference, service);
    }

    removedService(reference, service) {
        console.log('cdi.MultipleCardinality::removedService(reference)', reference);
        this._dependency.unbindService(reference, service);
    }

    isSatisfied() {
        return true;
    }
}
/**
 * Candinality: 1..n
 */
class MandatoryMultipleCardinality{
    constructor(dependency) {
        this._dependency = dependency;
        this._counter = 0;
    }
    addingService(reference, service) {
        console.log('cdi.MandatoryMultipleCardinality::addingService(reference)', reference, service);
        this._counter++;
        this._dependency.bindService(reference, service);

    }
    removedService(reference, service) {
        console.log('cdi.MandatoryMultipleCardinality::removedService(reference)', reference, service);
        this._counter--;
        this._dependency.unbindService(reference, service);
    }

    isSatisfied() {
        return this._counter > 0;
    }
}

function getCardinality(dependency, cardinality) {
    switch (cardinality) {
        case '0..1':
            return new OptionalCardinality(dependency);
        case '1..1':
            return new MandatoryCardinality(dependency);
        case '0..n':
            return new MultipleCardinality(dependency);
        case '1..n':
            return new MandatoryMultipleCardinality(dependency);
    }
    throw new Error(`Unknown candinality: ${cardinality}`);
}

/**
 *
 * @param {odss.framework.BundleContext}
 * @param {odss.cdi.ComponentManager}
 * @param {Object} reference
 * @constructor
 */
export class ReferenceDependency {
    constructor(ctx, manager, reference) {
        this.manager = manager;
        this.reference = reference;
        this.cardinality = getCardinality(this, reference.cardinality);
        this.tracker = ctx.serviceTracker(reference.filter || reference.interface, this.cardinality);
    }
    open() {
        this.tracker.open();
    }
    close() {
        this.tracker.close();
    }
    bindService(ref, service) {
        this.manager.bindHandler(this.reference.bind, service, ref);
    }
    unbindService(ref, service) {
        this.manager.unbindHandler(this.reference.unbind, service, ref);
    }
    isSatisfied() {
        return this.cardinality.isSatisfied();
    }
}
export class RequireDependency {
    constructor(ctx, manager, require, position) {
        this.manager = manager;
        this.position = position;
        this.cardinality = getCardinality(this, '1..1');
        this.tracker = ctx.serviceTracker(require, this.cardinality);
    }
    open() {
        this.tracker.open();
    }
    close() {
        this.tracker.close();
    }
    assignService(service) {
        this.manager.assignHandler(this.position, service);
    }
    unassignService(service) {
        this.manager.unassignHandler(this.position);
    }
    isSatisfied() {
        return this.cardinality.isSatisfied();
    }
}
