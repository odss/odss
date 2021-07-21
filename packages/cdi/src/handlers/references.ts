import {
    IFactoryContext,
    IHandler,
    IHandlerFactory,
    HandlerTypes,
    BindHandlerType,
} from '@odss/common';

import { BaseHandler } from './base';
import { ReferenceDependency } from './dependencies-trackers';

export class ReferencesHandlerFactory implements IHandlerFactory {
    getHandlers(factoryContext: IFactoryContext): IHandler[] {
        const bind = factoryContext.get<BindHandlerType[]>(HandlerTypes.BIND_DEPENDENCY) || [];
        const unbind = factoryContext.get<BindHandlerType[]>(HandlerTypes.UNBIND_DEPENDENCY) || [];
        const refs = groupBinders({ bind, unbind });
        return refs.length ? [new ReferencesHandler(refs)] : [];
    }
}

function groupBinders(items) {
    const result = {};
    for (const [type, groups] of Object.entries(items)) {
        for (const { token, key } of groups as any) {
            if (!result[token]) {
                result[token] = {
                    token,
                };
            }
            result[token][type] = key;
        }
    }
    return Object.values(result);
}

class ReferencesHandler extends BaseHandler {
    private references: ReferenceDependency[] = [];

    constructor(private refs: any) {
        super();
    }

    async validate() {
        const context = this.container.getBundleContext();
        const component = this.container.getComponent();
        this.references = this.refs.map(
            config => new ReferenceDependency(context, component, config)
        );
        await Promise.all(this.references.map(ref => ref.open()));
    }
    async invalidate() {
        await Promise.all(this.references.map(ref => ref.close()));
    }
}
