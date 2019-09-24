import {
    IBundle,
    IBundleContext,
    IBundleTrackerListener,
} from '@odss/common';

import { BundleContainer } from './bundle-container';

export class BundleRegister implements IBundleTrackerListener {

    private bundles: Map<number, BundleContainer> = new Map();

    constructor(private context: IBundleContext) {}

    public addingBundle(bundle: IBundle) {
        const container = this.getContainer(bundle);
        container.open();
    }

    public removedBundle(bundle: IBundle) {
        this.bundles.get(bundle.id).close();
        this.bundles.delete(bundle.id);
    }

    public modifiedBundle(bundle: IBundle) {
        this.bundles.get(bundle.id).modify();
    }

    public close() {
        this.bundles.forEach(container => {
            container.close();
        });
        this.bundles.clear();
    }
    private getContainer(bundle): BundleContainer {
        if (!this.bundles.has(bundle.id)) {
            this.bundles.set(bundle.id, new BundleContainer(bundle));
        }
        return this.bundles.get(bundle.id);
    }
}
