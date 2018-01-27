import {IHttpConnection, IAuthService} from 'atto-core-api';
import AuthService from './service';
import Repository from './repository';

export default class UserServiceTracker{
    constructor(ctx, dispacher) {
        this._ctx = ctx;
        this._dispacher = dispacher;
    }
    start() {
        this._tracker = this._ctx.serviceTracker(IHttpConnection, this).open();
    }
    stop() {
        this._tracker.close();
        this._reg = null;
    }
    async addingService(ref, connection) {
        const service = new AuthService(new Repository(connection), this._dispacher);
        await service.getUser();
        this._reg = this._ctx.registerService(IAuthService, service);


    }
    removedService(ref) {
        this._reg.unregister();
        this._reg = null;
    }
}
