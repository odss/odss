export const IManagerService = 'odss-api.IManagerService';

export interface IManagerService {
    updated(properties: object);
}

export abstract class ManagerService implements IManagerService {
    abstract updated(properties: object);
}