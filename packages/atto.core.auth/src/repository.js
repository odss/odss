export default class Repository{

    constructor(http) {
        this._http = http;
    }
    async getUser() {
        return await this._http.get('/api/auth/user');
    }
    async authencicate(data) {
        const params = {
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
        return await this._http.post('/api/auth/login', params);
    }
    async logout() {
        return await this._http.get('/api/auth/logout');
    }
}
