import {IHttpConnection} from 'atto-core-api';
import * as cdi from 'odss.cdi/decorators';


@cdi.Component('ViewsApp')
export class ViewsApp{
    constructor(){
        this._http = null;
    }
    @cdi.Validate
    async activate(ctx){
        console.log('MenuApp::active()');
        let menu = await this.getMenu()
        for(let item of menu){
            this.reg = ctx.registerService('ISiteBarItem', id => console.log('menu', id), {
                id: item.id,
                label: item.label,
                name: item.name,
                attrs: item.attrs || {}
            });
        }

    }
    @cdi.Invalidate
    deactivate(ctx) {
        console.log('MenuApp::deactive()');
        this.reg.unregister();
    }
    getMenu(){
        return Promise.resolve([{
            id: 100,
            label: 'Test 1',
            name: 'test1',
            attrs: {}
        }, {
            id: 101,
            label: 'Test 2',
            name: 'test2',
            attrs: {}
        }]);
    }
}


