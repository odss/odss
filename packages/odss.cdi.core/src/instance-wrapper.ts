import { Metadata } from './metadata';


export class InstanceWrapper {

    private instance: any = null;

    constructor(
        public readonly target: any,
        public readonly metatada: Metadata
    ) {

    }
    public isCreated() {
        return this.instance !== null;
    }
    public getInstance(): any {
        return this.instance;
    }
    public create(dependencies=[]): void {
        if (this.instance) {
            this.throwError('Object is created.');
        }
        const ComponentClass = this.target;
        if (typeof ComponentClass !== 'function') {
            this.throwError('Constructor is not function.');
        }
        try {
            this.instance = new ComponentClass(...dependencies);
        } catch (ex) {
            this.throwError('Problem with creating object.', ex);
        }
    }
    public invoke(name: string, ...args: any[]): void {
        if (this.instance === null) {
            this.throwError('Not created object.');
        }
        if (typeof this.instance[name] !== 'function') {
            this.throwError('Incorrect invoked method: ' + name);
        }
        return this.instance[name](...args);
    }
    public set(name: string, value: any): void {
        if (this.instance === null) {
            this.throwError('Not created object.');
        }
        Object.defineProperty(this.instance, name, {
            value,
            writable: false,
        });
    }
    public dispose(): void {
        if (this.instance) {
            if (typeof this.instance.dispose === 'function') {
                this.instance.dispose();
            }
            this.instance = null;
        }
    }
    private throwError(reason: string, ex: any = null): never {
        throw new Error(reason);
        // let name = this.metadata.name !== this.metadata.specifications ? this.metadata.name + '(' + (this.metadata.specifications) + ')' : this.metadata.name;
        // throw new Error('Some problem with this.component "' + name + '". ' + reason + ' (' + ex + ')', ex);
    }

    private createError(reason: string, ex: any = null) {
        // this.component = null;
        // this.methods = [];
        // let name = this.metadata.name !== this.metadata.specifications ? this.metadata.name + '(' + (this.metadata.specifications) + ')' : this.metadata.name;
        // return new Error(`Can\'t create component ${name}. ${reason} (${ex})`, ex);
    }

}