export interface IUser {
    readonly id: string;

    isAnonymous(): boolean;
}
export interface UserEvent {
    readonly type: string;
    readonly user: IUser;
}

export class IUserService{
    getUser(){
    }

    update(data){

    }
}

class IUserEvent{
    readonly type: string;
    readonly user: IUser;
}
export class IUserListener{
    userEvent(event: IUserEvent){}
}

export class UserEvent{
    constructor(type, user){
        this.type = type;
        this.user = user;
    }
}