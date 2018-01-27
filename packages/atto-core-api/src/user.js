export class IUser {
    get id() {}
    isAnonymous() {}
}


export class IUserService{
    update(data) {}
}

export class IUserListener{
    userEvent(event) {}
}

export class UserEvent{
    constructor(type, user){
        this.type = type;
        this.user = user;
    }
}

UserEvent.LOADED = 'user.loaded';