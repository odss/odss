import {IHttpConnection} from 'atto-core-api';
import * as cdi from 'odss.cdi/decorators';


@cdi.Component('ViewsApp')
@cdi.Assign('_http', IHttpConnection)
export class ViewsApp{
    constructor(){
        this._http = null;
    }
    @cdi.Validate
    async activate(ctx){
        console.log('ViewsApp::active()');
        let pages = await this.getPages()
        for(let page of pages){
            this.reg = ctx.registerService('ISiteBarItem', id => console.log('menu', id), {
                id: page.id,
                label: page.label,
                name: page.name,
                attrs: page.attrs || {}
            });
        }

    }
    @cdi.Invalidate
    deactivate(ctx) {
        console.log('ViewsApp::deactive()');
        this.reg.unregister();
    }
    async getPages(){
        const params = {
            body: JSON.stringify({
                query: 'SELECT * FROM atto.pages ORDER BY sort LIMIT 5',
                params: null
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
        const response =  await this._http.post('/api/source/query', params);
        return response.data;
    }
}


