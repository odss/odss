import {
    IBundle,
} from '@odss/common';

import { MetadataScanner, Metadata } from './metadata';
import { InstanceWrapper } from './instance-wrapper';
import { ComponentContainer } from './component-container';

export class BundleContainer {

    private components: ComponentContainer[] = [];

    constructor(private bundle: IBundle) {
        for(const instanceWrapper of this.scanBundle(bundle)) {
            const component = new ComponentContainer(bundle, instanceWrapper);
            this.components.push(component);
        }
    }
    open() {
        for(const component of this.components) {
            component.open();
        }
    }

    close() {
        for(const component of this.components) {
            component.close();
        }
    }
    modify() {
        for(const component of this.components) {
            component.modify();
        }
    }
    private *scanBundle(bundle: IBundle): Generator<InstanceWrapper> {
        for(const target of MetadataScanner.findComponents(bundle.meta)) {
            const metadata =  MetadataScanner.scan(target);
            yield new InstanceWrapper(target, metadata);
        }
    }
}