export class IHttpConnection {

    /**
     * Send GET reguest
     *
     * @param {String} url
     * @param {Object} params
     * @return {Promise}
     */
    get(url, params) {}

    /**
     * Send POST reguest
     *
     * @param {String} url
     * @param {Object} params
     * @return {Promise}
     */
    post(url, params) {}

    head(url, params) {}

    delete(url, params) {}

    put(url, params) {}
}

export class ISocketConnection {

    open() {}

    close() {}

    call(topic, params=[]) {}

    send(action, callback, bind) {}

    register(topic, handler) {}

    publish(topic, params=[]) {}

    subscribe(topic) {}
}