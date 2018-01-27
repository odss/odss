import {Component, Property, Validate, Invalidate, Bind, Unbind, Assign} from 'odss.cdi/decorators';


@Component('MainUI', ['IHttpConsole'])
// @Property('baseUrl', 'http.url2', 'http://localhost')
// @Assign('$users', 'IUserService')
export class MainUI{

    constructor(){
        this._apps = {};
        this.$users = null;
    }
    
    @Validate
    activate(ctx) {
        console.log('MainUI::activate()');
    }
    @Invalidate
    deactivate(ctx) {
        console.log('MainUI::deactivate()');
    }
    @Bind('IApp', '1..n')
    addApp(ref, app){
        console.log('MainUI::addApp('+ref.id +','+app+')');
        this._apps[ref.id] = app
    }
    @Unbind('IApp')
    removeApp(ref, app){
        console.log('MainUI::removeApp('+ref.id +','+app+')');
        delete self._apps[ref.id]
    }
}
