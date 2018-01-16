import cdi from './decorators';


@cdi('MainUI')

export class MainUI{

    // @cdi.assign('IUserService')
    // $users;

    constructor(){
        this._apps = {};
    }

    @cdi.activate
    activate(ctx) {
        console.log('MainUI::activate()');
    }
    @cdi.deactivate
    deactivate(ctx) {
        console.debug('MainUI::deactivate()');
    }
    @cdi.bind('IApp', '0..n')
    addApp(ref, app){
        console.debug('MainUI::addApp('+ref.id +','+app+')');
    }
    @cdi.unbind('IApp')
    removeApp(ref, app){

    }
}

export function start(ctx) {
    setTimeout(() => {
        ctx.registerService('IApp', 'app test', {name:'name'});
    }, 2000)
}

export function stop(ctx) {
}


