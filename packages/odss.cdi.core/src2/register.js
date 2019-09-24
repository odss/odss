
export default class ComponentsRegister{
    constructor() {
        this._managers = [];
    }
    register(manager) {
        if (!this._managers.includes(manager)) {
            this._managers.push(manager);
        }
    }
    unregister(manager) {
        manager.close();
        let index = this._managers.indexOf(manager);
        this._managers.splice(index, 1);
    }
    removeBundle(bundleId) {
        let manager;
        for (let i = this._managers.length - 1; i >= 0; i--) {
            manager = this._managers[i];
            if (manager.bundle.id === bundleId) {
                this.unregister(manager);
            }
        }
    }
    close() {
        for (let i = 0; i < this._managers.length; i++) {
            await this._managers[i].close();
        }
        this._managers = [];
    }
}
