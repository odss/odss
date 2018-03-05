import {IAuthService, BasicCredential} from 'atto-core-api/auth';
import {Assign, Component, Validate, Invalidate} from 'odss.cdi/decorators';

import UI from './ui';


@Component('LoginPanel')
@Assign('$auth', IAuthService)
export class LoginPanel{
    constructor(){
        this.$auth = null;
    }
    @Validate
    async activate(ctx){
        this.ui = new UI(this);
        this.ui.show();
    }
    @Invalidate
    deactivate(ctx) {
        this.ui.dispose();
        this.ui = null;
    }

    async login(login, password){
        this.ui.error('');
        this.ui.wait(true);
        await this.$auth.authencicate(
            new BasicCredential(login, password)
        );
        this.ui.wait(false);
    }
}