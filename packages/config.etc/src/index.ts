import { IBundleContext, IConfigStorage, Properties } from '@odss/common';
// import { v4 as uuid4 } from 'uuid';
import { Etcd3, Namespace } from 'etcd3';



class EtcConfigStorage implements IConfigStorage {
    private client: Etcd3 = new Etcd3();
    private ns: Namespace;

    constructor(private prefix: string) {

    }
    async start() {
        this.ns = await this.client.namespace(this.prefix);
    }
    exists(pid: string): Promise<boolean> {
        return this.ns.get(pid).exists();
    }
    load(pid: string): Promise<Properties> {
        return this.ns.get(pid).json();
    }
    store(pid: string, properties: Properties): Promise<void> {
        throw new Error('Method not implemented.');
    }
    remove(pid: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getPids(): Promise<string[]> {
        return this.ns.getAll().keys();
    }

}

export class ACtivator {
    start(ctx: IBundleContext) {

    }
}