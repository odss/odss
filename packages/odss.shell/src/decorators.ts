import 'reflect-metadata';
import { ICommand } from '@odss/api';

type IOptionStore = {
    name: string,
    flags: string,
    description: string,
    defaultValue: any,
};
type ICommandStore = {
    name: string,
    config: {
        description?: string,
    },
};
type IStore = {
    name: string,
    config: {
        description: string,
    },
    options: IOptionStore[],
};

const REFLECT_STORE = 'odss:shell:store';

function getStore(target: Function): IStore {
    // @ts-ignore
    if (!Reflect.hasMetadata(REFLECT_STORE, target)) {
    // @ts-ignore
        Reflect.defineMetadata(REFLECT_STORE, {
            name: '',
            config: [],
            options: [],
        }, target);
    }
    // @ts-ignore
    return <IStore>Reflect.getMetadata(REFLECT_STORE, target);
}

export function getTargetProps(obj) {
    const props = Object.getPrototypeOf(obj);
    // @ts-ignore
    return Reflect.getMetadata(REFLECT_STORE, props.constructor);
}

function update(target: Function, data: ICommandStore): void {
    Object.assign(getStore(target), data);
}
function addOption(target: Function, option: IOptionStore): void {
    getStore(target).options.push(option);
}

export function Command(name: string, config={}) {
    return (target: Function) => {
        update(target, { name, config });
    };
}

export function Option(
    flags: string,
    name: string = '',
    description: string = '',
    defaultValue: any =null
): (target: Function ) => void {
    return (target: Function) => {
        addOption(target, { flags, name, description, defaultValue });
    };
}