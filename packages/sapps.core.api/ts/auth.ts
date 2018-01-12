export const Events = {
    AUTH_SUCCESS: 'auth.success',
    AUTH_INVALID_CREDENTIAL: 'auth.invalid.credential',
    AUTH_UNCATEGORIZED: 'auth.uncategorized',
}

export const USER_LOADED = 'user.loaded';


export interface IAuthEvent {
    readonly type:string;
}
export interface IAuthListener {
    authEvent(event: IAuthEvent);
}

export interface IAuthResult{
    readonly type: string;
    readonly identity: string;
    readonly messages: string[];
}

export interface IAuthAdapter {
    authenticate(): Promise<IAuthResult>
}
export interface IAuthService {
    authenticate(adapter: IAuthAdapter): Promise<IAuthResult>;
    getIdentity(): Promise<string>;
    clearIdentity(): Promise<any>;
}

export class AuthResult implements IAuthResult{
    readonly type: string;
    readonly identity: string;
    readonly messages: string[];
}

export class AuthService implements IAuthService{
    authenticate(adapter: IAuthAdapter){
        return Promise.resolve(new AuthResult())     
    }
    getIdentity(): Promise<string> {
        return Promise.resolve('user');
    }
    clearIdentity(): Promise<any> {
        return Promise.resolve();
    }
}

export interface IUser {
    readonly id: string;

    isAnonymous(): boolean;
}
export interface IUserEvent {
    readonly type: string;
    readonly user: IUser;
}
export interface IUserListener {
    userEvent(event: IUserEvent): void;
}
