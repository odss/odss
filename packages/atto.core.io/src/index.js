import {IHttpConnection} from 'atto-core-api'


class HttpConnection{
    constructor(baseUrl){
        this.baseUrl = baseUrl;
    }
    async get(url, params={}) {        
        return await this.send(url, 'GET', params);
    }
    /**
     * Send POST reguest
     *
     * @param {String} url
     * @param {Object} params
     * @return {Promise}
     */
    async post(url, params={}){
        return await this.send(url, 'POST', params);
    }

    async head(url, params={}){
        return await this.send(url, 'HEAD', params);
    }

    async delete(url, params={}){
        return await this.send(url, 'DELETE', params);
    }

    async put(url, params={}){
        return await this.send(url, 'PUT', params);    
    }
    async send(url, method, params={}){
        if(url[0] == '/'){
            url = this.baseUrl + url;
        }
        params.method = method;
        params.credentials = 'include';
        params.mode = 'cors';
        // params.credentials = 'same-origin';

        const response = await fetch(url, params);
        if (response.status >= 200 && response.status < 300) {
            const contentType = response.headers.get('Content-Type')
            if(contentType.substr(0, 10) === 'plain/text'){
                return await response.text()
            }
            return response.json();
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }
}

export function start(context){
    const baseUrl = context.property('http.url');
    const http = new HttpConnection(baseUrl);
    context.registerService(IHttpConnection, http, {
        type: 'http'
    });
}
export function stop(context){

}