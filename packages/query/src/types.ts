import { Filter } from './filters';

type QueryValue = string | Filter | Filter[];
export type QueryObject = Record<string, string>;
export type QueryType = QueryValue | QueryObject;
