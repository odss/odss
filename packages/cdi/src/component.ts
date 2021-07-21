import { IComponent } from '@odss/common';

export class Component implements IComponent {
    private instance: any = null;

    constructor(public readonly target: any) {}
    public isCreated() {
        return this.instance !== null;
    }
    public getInstance(): any {
        return this.instance;
    }
    public create(dependencies = []): any {
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
        return this.instance;
    }
    public invoke(name: string, args: any[]): void {
        if (this.instance === null) {
            this.throwError(
                `Cannot invoke method ${this.target.name}.${name}() because object wasn't created.`
            );
        }
        if (typeof this.instance[name] !== 'function') {
            this.throwError(`Incorrect invoked method: ${name}`);
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
    public async dispose(): Promise<void> {
        if (this.instance) {
            if (typeof this.instance.dispose === 'function') {
                await this.instance.dispose();
            }
            this.instance = null;
        }
    }
    private throwError(reason: string, ex: any = null): never {
        throw new Error(reason);
        // let name = this.metadata.name !== this.metadata.specifications ? this.metadata.name + '(' + (this.metadata.specifications) + ')' : this.metadata.name;
        // throw new Error('Some problem with this.component "' + name + '". ' + reason + ' (' + ex + ')', ex);
    }
}
