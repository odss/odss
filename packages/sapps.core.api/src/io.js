export class IConnection{

    /**
     * Send reguest
     *
     * @param {String} method
     * @param {Object} params
     * @return {Promise}
     */
    send(method, params) {
    }
}

export class IHttpConnection extends IConnection {

    /**
     * Send reguest
     *
     * @param {String} url
     * @param {Object} params
     * @return {Promise}
     */
    get(url, params) {

    }
    post(url, params){

    }
    head(url, params){

    }
    delete(url, params){
            
    }
    put(url, params){
            
    }
}

export class ISocketConnection extends IHttpConnection {

    send(action, callback, bind) {

    }
    on(action, callback, bind){

    }
    off(action, callback, bind){

    }
}