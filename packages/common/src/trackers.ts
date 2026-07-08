import { Events } from './consts'
import {
    IBundle,
    IBundleContext,
    IBundleTracker,
    IServiceListener,
    IServiceReference,
    IServiceTrackerListener,
    IServiceTrackerCustomizer,
    IServiceTrackerListenerType,
    IServiceTracker,
    IBundleTrackerListener,
    IDisposable,
    NamedServiceType,
    FilterType,
} from './types/core'
import { toDisposable } from './utils'
import { ServiceEvent, BundleEvent } from './events'

export function createServiceTracker<S = any>(
    ctx: IBundleContext,
    name: NamedServiceType,
    listener: IServiceTrackerListenerType<S> = null,
    filter: FilterType = ''
): IServiceTracker<S> {
    return new ServiceTracker(ctx, name, listener, filter)
}
export async function trackService<S>(
    ctx: IBundleContext,
    service: S,
    resolve: (service: S, reference: IServiceReference) => Promise<() => Promise<void> | undefined>,
    filter?: FilterType
): Promise<() => Promise<void>> {
    let untrack: () => Promise<void> | null = null
    let ref: IServiceReference
    const tracker = new ServiceTracker(
        ctx,
        service,
        {
            async addingService(service: S, reference: IServiceReference) {
                if (!ref) {
                    ref = reference
                    untrack = await resolve(service, reference)
                }
            },
            async modifiedService(service: S, reference: IServiceReference) {
                if (ref === reference) {
                    if (untrack) {
                        await untrack()
                    }
                    untrack = await resolve(service, reference)
                }
            },
            async removedService(_: S, reference: IServiceReference) {
                if (ref === reference) {
                    if (untrack) {
                        await untrack()
                    }
                    untrack = null
                    ref = null
                }
            },
        },
        filter
    )
    await tracker.open()
    return async () => {
        await tracker.close()
        ref = null
        untrack = null
    }
}

export async function trackServices(
    ctx: IBundleContext,
    deps: Array<any>,
    factory: (services: Array<any>) => Promise<() => Promise<void>>
): Promise<() => void> {
    const state = {
        valid: false,
        disposer: null,
    }
    const providers: Map<number, any> = new Map()
    const refs: Set<IServiceReference> = new Set()

    const validate = async () => {
        if (!state.valid && providers.size === deps.length) {
            state.valid = true
            state.disposer = await factory(deps.map((name) => providers.get(name)))
        } else if (state.valid && providers.size !== deps.length) {
            state.valid = false
            if (state.disposer) {
                await state.disposer()
                state.disposer = null
            }
        }
    }
    const trackers = deps.map((name) => {
        return new ServiceTracker(ctx, name, {
            async addingService(service: any, reference: IServiceReference) {
                if (!providers.has(name)) {
                    providers.set(name, { service, reference })
                    refs.add(reference)
                    await validate()
                }
            },
            async modifiedService(service: any, reference: IServiceReference) {
                await this.removedService(service, reference)
                await this.addingService(service, reference)
            },
            async removedService(_: any, reference: IServiceReference) {
                if (refs.has(reference) && providers.has(name)) {
                    providers.delete(name)
                    refs.delete(reference)
                    await validate()
                }
            },
        })
    })
    await Promise.all(trackers.map((tracker) => tracker.open()))
    await validate()

    return async () => {
        await Promise.all(trackers.map((tracker) => tracker.close()))
        providers.clear()
        trackers.length = 0
        refs.clear()
        if (state.disposer) {
            await state.disposer()
            state.disposer = null
        }
    }
}
export class ServiceTracker<S = any>
    implements IServiceTracker<S>, IServiceTrackerListener<S>, IServiceTrackerCustomizer<S>
{
    private _tracked?: ServiceTracked<S>
    private _listenerDispose?: IDisposable

    constructor(
        private _ctx: IBundleContext,
        private _name: NamedServiceType,
        private _listener: IServiceTrackerListenerType<S> = null,
        private _filter: FilterType = ''
    ) {
        if (!_name) {
            throw new TypeError('Empty name')
        }
        if (this._listener === null) {
            this._listener = this
        }
    }
    async open(): Promise<void> {
        if (!this._tracked) {
            this._tracked = new ServiceTracked(this)
            this._ctx.addServiceListener(this._tracked, this._name, this._filter)
            const refs = this._ctx.getServiceReferences(this._name, this._filter)
            for (let i = 0, j = refs.length; i < j; i++) {
                await this._tracked.track(refs[i])
            }
        }
    }
    async close(): Promise<void> {
        if (this._tracked) {
            this._ctx.removeServiceListener(this._tracked)
            await this._tracked.close()
            this._tracked = undefined
        }
    }
    async adding(reference: IServiceReference): Promise<S> {
        const service = this._ctx.getService<S>(reference)
        if (this._listener) {
            if (typeof this._listener === 'function') {
                const result = await this._listener(service, reference)
                this._listenerDispose = toDisposable(result)
            } else {
                await this._listener.addingService(service, reference)
            }
        }
        return service
    }
    async modified(reference: IServiceReference, service: S): Promise<void> {
        if (this._listener && typeof this._listener !== 'function') {
            await this._listener.modifiedService(service, reference)
        }
    }
    async removed(reference: IServiceReference, service: S): Promise<S> {
        if (this._listener) {
            if (typeof this._listener === 'function') {
                if (this._listenerDispose && this._listenerDispose.dispose) {
                    this._listenerDispose.dispose()
                }
            } else {
                await this._listener.removedService(service, reference)
            }
        }
        this._ctx.ungetService(reference)
        return service
    }
    size(): number {
        return this._tracked ? this._tracked.size() : 0
    }
    getReference(): IServiceReference {
        return this.getReferences()[0]
    }
    getReferences(): IServiceReference[] {
        return this._tracked ? this._tracked.getReferences() : []
    }
    getService(): S {
        return this.getServices()[0]
    }
    getServices(): S[] {
        return this._tracked ? this._tracked.getServices() : []
    }
    async addingService(service: S, reference: IServiceReference): Promise<void> {
        // do nothing
    }
    async modifiedService(service: S, reference: IServiceReference): Promise<void> {
        // do nothing
    }
    async removedService(service: S, reference: IServiceReference): Promise<void> {
        // do nothing
    }
}

export class BundleTracker implements IBundleTracker, IBundleTrackerListener {
    private _tracked?: BundleTracked

    constructor(private _ctx: IBundleContext, private _mask: number, private _listener: IBundleTrackerListener = null) {
        if (!_mask) {
            throw new Error('Not set mask for bundles')
        }
        if (this._listener === null) {
            this._listener = this
        }
    }
    async open(): Promise<void> {
        if (!this._tracked) {
            this._tracked = new BundleTracked(this._mask, this._listener)
            this._ctx.addBundleListener(this._tracked)
            const bundles = this._ctx.getBundles()
            for (let i = 0, j = bundles.length; i < j; i++) {
                if (bundles[i].state && this._mask) {
                    await this._tracked.track(bundles[i])
                }
            }
        }
    }
    async close(): Promise<void> {
        if (this._tracked) {
            this._ctx.removeBundleListener(this._tracked)
            await this._tracked.close()
            this._tracked = undefined
        }
    }
    size(): number {
        return this._tracked ? this._tracked.size() : 0
    }
    bundles(): IBundle[] {
        return this._tracked ? this._tracked.getBundles() : []
    }

    async addingBundle(bundle: IBundle): Promise<void> {
        //do nothing
    }
    async modifiedBundle(bundle: IBundle): Promise<void> {
        //do nothing
    }
    async removedBundle(bundle: IBundle): Promise<void> {
        //do nothing
    }
}

class ServiceTracked<TService> implements IServiceListener {
    private tracked: Map<IServiceReference, TService> = new Map()

    constructor(private customizer: IServiceTrackerCustomizer<TService>) {}

    async serviceEvent(event: ServiceEvent) {
        switch (event.type) {
            case Events.REGISTERED:
            case Events.MODIFIED:
                await this.track(event.reference)
                break
            case Events.UNREGISTERED:
                await this.untrack(event.reference)
                break
        }
    }
    async track(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference) as TService
            await this.modified(reference, service)
        } else {
            const service = await this.adding(reference)
            if (service) {
                this.tracked.set(reference, service)
            }
        }
    }
    async untrack(reference: IServiceReference) {
        if (this.tracked.has(reference)) {
            const service = this.tracked.get(reference) as TService
            this.tracked.delete(reference)
            await this.removed(reference, service)
        }
    }
    async close() {
        const items = Array.from(this.tracked.keys())
        for (const item of items) {
            await this.untrack(item)
        }
    }
    async adding(reference: IServiceReference) {
        return this.customizer.adding(reference)
    }
    async modified(reference: IServiceReference, service: TService) {
        await this.customizer.modified(reference, service)
    }
    async removed(reference: IServiceReference, service: TService) {
        await this.customizer.removed(reference, service)
    }
    size(): number {
        return this.tracked.size
    }
    getServices(): Array<TService> {
        return Array.from(this.tracked.values())
    }
    getReferences(): Array<IServiceReference> {
        return Array.from(this.tracked.keys())
    }
}
class BundleTracked {
    private bundles: Set<IBundle> = new Set()

    constructor(private mask: number, private listener: IBundleTrackerListener) {}
    async bundleEvent(event: BundleEvent): Promise<void> {
        if (event.bundle.state & this.mask) {
            await this.track(event.bundle)
        } else {
            await this.untrack(event.bundle)
        }
    }
    async track(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            await this.listener.modifiedBundle(bundle)
        } else {
            this.bundles.add(bundle)
            await this.listener.addingBundle(bundle)
        }
    }
    async untrack(bundle: IBundle) {
        if (this.bundles.has(bundle)) {
            this.bundles.delete(bundle)
            await this.listener.removedBundle(bundle)
        }
    }
    size() {
        return this.bundles.size
    }
    close() {
        this.bundles.clear()
    }
    getBundles(): Array<IBundle> {
        return Array.from(this.bundles)
    }
}
