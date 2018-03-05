import {IAuthService, BasicCredential} from 'atto-core-api/auth';
import * as cdi from 'odss.cdi/decorators';
import UI from './ui';


@cdi.Component('Add')
@cdi.Assign('$auth', IAuthService)
export class MainUi {
    constructor(){
        this.$auth = null;
        this.mediator = null;
    }
    @cdi.Validate
    async activate(ctx){
        console.log('MainUi::active()');
        this.mediator = new Mediator(this.$auth);
        this.ui = new UI(this.mediator);
        this.ui.show();
        const user = await this.$auth.getUser();
        this.ui.setUser(user);
    }
    @cdi.Invalidate
    deactivate(ctx) {
        console.log('MainUi::deactive()');
        this.ui.dispose();
        this.mediator.dispose();
        this.ui = null;
    }

    @cdi.Bind('ISiteBarItem', '0..n')
    addSiteBar(ref, item){
        this.ui.addSiteBar(ref.id, ref.properties)
        // console.log('addSiteBar', ref.properties, item);
    }

    @cdi.Unbind('ISiteBarItem')
    removeSiteBar(ref){
        this.ui.removeSiteBar(ref.id);
        console.log('removeSiteBar', ref);
    }
}

class Mediator{
    constructor(auth){
        this.auth = auth;
        this.view = null;
    }
    logout(){
        this.auth.logout();
    }
    dispose(){
        this.auth = null;
        this.view = null;
    }
}