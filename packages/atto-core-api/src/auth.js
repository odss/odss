export class IAuthListener {
    authEvent(event){}
}

export class BasicCredential{
    constructor(login, password){
        this.type = 'basic';
        this.login = login;
        this.password = password
    }
    serialize(){
        return {
            type: this.type,
            login: this.login,
            password: this.password
        };
    }
}

export class IAuthService {
    authenticate(credential) {}
    getIdentity() {}
    clearIdentity() {}
}

export class AuthEvent{
    constructor(type, user){
        this.type = type;
        this.user = user;
    }
}
AuthEvent.SUCCESS ='auth.success';
AuthEvent.INVALID_CREDENTIAL = 'auth.invalid.credential';
AuthEvent.UNCATEGORIZED  = 'auth.uncategorized';
AuthEvent.LOGOUT  = 'auth.logout';
