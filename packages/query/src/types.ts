import { Filter } from './filters';

type QueryValue = string | Filter | Filter[];
export type QueryObject = Record<string, string>;
export type QueryType = QueryValue | QueryObject;

export type PValue = string | string[] | number | number[];
export type Params = {
    [key: string]: PValue;
};

export interface IFilter {
    readonly opt: string;
    match(params: Params): boolean;
}
export interface INamedsFilter extends IFilter {
    readonly name: string;
    readonly value: string;
}
export interface ICompositeFilter extends IFilter {
    filters: IFilter[];
}