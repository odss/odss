import UserServiceTracker from './tracker';
import EventDispatcher from './event';


export class Activator{
    start(ctx) {
        this.service = new UserServiceTracker(ctx, new EventDispatcher(ctx));
        this.service.start();
    }
    stop(ctx) {
        this.service.stop();
        this.service = null;
    }
}
