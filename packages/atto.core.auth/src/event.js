import {AuthEvent, UserEvent, IAuthListener, IUserListener} from 'atto-core-api';

export default class EventDispatcher{
    constructor(ctx) {
        this._auth = ctx.serviceTracker(IAuthListener);
        this._auth.open();
        this._user = ctx.serviceTracker(IUserListener);
        this._user.open();
    }
    dispose(){
        this._auth.close();
        this._user.close();
    }
    auth(type, user) {
        const event = new AuthEvent(type, user);
        const listeners = this._auth.getServices();
        for (let listener of listeners) {
            listener.authEvent(event);
        }
    }
    user(type, user){
        const event = new UserEvent(type, user);
        const listeners = this._user.getServices();
        for (let listener of listeners) {
            listener.userEvent(event);
        }
    }
}
