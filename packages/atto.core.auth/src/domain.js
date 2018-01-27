
export class User{
    constructor(uid, params){

        Object.defineProperties(this, {
            uid:{
                get:function(){
                    return uid;
                },
                enumerable: true
            },
            name:{
                value:params.name,
                enumerable: true,
            },
            login:{
                value:params.login,
                enumerable: true,
            }
        });
        this._params = params;
    }

    serialize(){
        var params = sjs.clone(this._params);
        params.id = this.id;
        return params;
    }
    isAnonymous() {
        return false;
    }
}

export class AnonymousUser extends User{
    constructor(){
        super(0, {name:'Anonymous', login:''});
    }
    isAnonymous() {
        return true;
    }
    getName(){
        return 'Anonymous';
    }
}

export function createUser(params) {
    params = params || {};
    return params.uid ? new User(params.uid, params) : new AnonymousUser();
}