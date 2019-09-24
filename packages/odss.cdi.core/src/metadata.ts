import { MetadataKeys } from '@odss/cdi';

export type Metadata = {
    name: string,
    validate: string,
    invalidate: string,
    dependencies: MetadataDependencies,
};

export type MetadataComponent = {
    name: string,
};

export type MetadataDependencies = {
    self: MetadataSelfDependency[],
    params: MetadataParameterDependency[],
    references: MetadataReferenceDependency[],
};

export type MetadataBindDependency = {
    type: string,
    cardinality: string,
    key: string,
};

export type MetadataUnbindDependency = {
    type: string,
    key: string,
};

export type MetadataSelfDependency = {
    type: string,
    index: number,
};

export type MetadataParameterDependency = {
    type: string,
    key: string,
};

export type MetadataReferenceDependency = {
    type: string,
    cardinality: string,
    bind: string,
    unbind: string,
};


export class MetadataScanner {

    public static findComponents(meta: any) {
        return Object.values(meta).filter(item =>
            !!Reflect.getMetadata(MetadataKeys.COMPONENT, item));
    }

    public static scan(component: any): Metadata {
        const { name } = reflectComponent(component);
        const binds = reflectBindDependencies(component);
        const unbinds = reflectUnbindDependencies(component);
        return {
            name,
            validate: reflectValidate(component),
            invalidate: reflectInvalidate(component),
            dependencies: {
                self: reflectConstructorDependencies(component),
                params: reflectParamDependencies(component),
                references: groupReferences(binds, unbinds),
            }
        };
    }
}

function reflectComponent(component: any): MetadataComponent {
    return Reflect.getMetadata(
        MetadataKeys.COMPONENT,
        component,
    ) || { name: 'Unknown' };
}

function groupReferences(binds, unbinds): MetadataReferenceDependency[] {
    const groups = {};
    for (const { key, type, cardinality } of binds) {
        groups[type] = {
            type,
            cardinality,
            bind: key,
            unbind: null,
        };
    }
    for (const { key, type } of unbinds) {
        groups[type].unbind = key;
    }
    return Object.values(groups) as MetadataReferenceDependency[];
}

function reflectConstructorDependencies(component: any): MetadataSelfDependency[] {
    return Reflect.getMetadata(
        MetadataKeys.CONSTRUCTOR_DEPENDENCY,
        component,
    ) || [];
}
function  reflectParamDependencies(component: any): MetadataParameterDependency[] {
    return Reflect.getMetadata(
        MetadataKeys.PROPERTIES_DEPENDENCY,
        component,
    ) || [];
}
function reflectBindDependencies(component: any): MetadataBindDependency[] {
    return Reflect.getMetadata(
        MetadataKeys.BIND_DEPENDENCY,
        component,
    ) || [];
}
function reflectUnbindDependencies(component: any): MetadataUnbindDependency[] {
    return Reflect.getMetadata(
        MetadataKeys.UNBIND_DEPENDENCY,
        component,
    ) || [];
}
function reflectValidate(component: any): string {
    return Reflect.getMetadata(
        MetadataKeys.VALIDATE_METHOD,
        component,
    ) || '';
}
function reflectInvalidate(component: any): string {
    return Reflect.getMetadata(
        MetadataKeys.INVALIDATE_METHOD,
        component,
    ) || '';
}
