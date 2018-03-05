import {AuthEvent, UserEvent} from 'atto-core-api';
import {createUser} from './domain';

export default class UserService{
    constructor(repository, dispacher) {
        this._repository = repository;
        this._dispacher = dispacher;
        this._user = null;
    }
    async getUser(){
        if(this._user === null){
            try{
                const data = await this._repository.getUser();
                this._user = createUser(data);
                this._dispacher.user(UserEvent.LOADED, this._user);
            }catch(e){
                console.warn(e);
            }
        }
        return this._user;
    }
    async authencicate(credentials) {
        const creds = credentials.serialize()
        try{
            await this._repository.authencicate(creds);
            const user = await this.getUser();
            this._dispacher.auth(AuthEvent.SUCCESS, user);
        }catch(e){
            console.warn(e);
        }
    }
    async logout(){
        await this._repository.logout();
        const user = this._user;
        this._user = null;
        this._dispacher.auth(AuthEvent.LOGOUT, user);
    }
}