import {IHttpConnection, IAuthService, IAuthListener, AuthEvent} from 'atto-core-api';

import * as cdi from 'odss.cdi/decorators';


@cdi.Component('CoreMain')
@cdi.Assign('$http', IHttpConnection)
@cdi.Assign('$auth', IAuthService)
export class CoreMain{
    constructor(){
        this.$http = null;
        this.$auth = null;
        this.bundles = [];
    }
    @cdi.Validate
    async activate(ctx) {
        this.ctx = ctx;
        ctx.registerService(IAuthListener, this);

        console.log('CoreMain::activate()');
        await this._updateBundles();
    }
    @cdi.Invalidate
    deactivate(ctx) {
        this.ctx = null;
        console.log('CoreMain::deactivate()');
    }

    async authEvent(event){
        switch(event.type){
            case AuthEvent.SUCCESS:
            case AuthEvent.LOGOUT:
                await this._updateBundles();
                break;
        }
        console.log(event, AuthEvent);

    }
    async _updateBundles(){
        const currents = this.ctx.getBundles().map(bundle => bundle.meta.location);
        if(!this.bundles.length){
            this.bundles = currents; // core
        }

        const bundles = await this.$http.get('/api/bundles/list');
        const toInstall = bundles.filter(bundle => !currents.includes(bundle));
        const toUninstall = currents
            .filter(bundle => !bundles.includes(bundle))
            .filter(bundle => !this.bundles.includes(bundle));
        for(let bundle of toUninstall){
            let obj = this.ctx.getBundle(bundle);
            await this.ctx.uninstallBundle(obj);
        }
        for(let bundle of toInstall){
            await this.ctx.installBundle(bundle, true);
        }
    }
}