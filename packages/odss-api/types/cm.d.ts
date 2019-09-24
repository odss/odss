export declare const IManagerService = "odss-api.IManagerService";
export interface IManagerService {
    updated(properties: object): any;
}
export declare abstract class ManagerService implements IManagerService {
    abstract updated(properties: object): any;
}
