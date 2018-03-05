
import dom from 'sjs-dom';
import './main.scss'
import TEMPLATE from './main.html'
import USER_NAV from './user-nav.html';


export default class UI{
    constructor(mediator){
        this.mediator = mediator
        this.mediator.view = this;
        this._sitebar = new Map();
    }
    setUser(user){
        if(this.user){
            this.user.setUser(user.name);
        }
    }
    addSiteBar(id, props){
        this._sitebar.set(id, props);
        this._updateSitebar();
    }
    removeSiteBar(id){
        this._sitebar.delete(id);
        this._updateSitebar();
    }
    show(){
        const $div = document.createElement('div')
        $div.innerHTML = TEMPLATE.trim()
        this.$dom = $div.firstChild
        document.body.appendChild(this.$dom);
        document.body.classList.add('atto-main-ui');
        this.user = new UserNav(this.mediator, document.querySelector('#atto-user-nav'));
    }
    dispose(){
        this.user.dispose();
        document.body.removeChild(this.$dom)
        document.body.classList.remove('atto-main-ui');
        this.$dom = null;
    }
    _updateSitebar(){
        if(this.$dom){
            const $dom =  this.$dom.querySelector('#atto-app-sidebar nav')
            const buff = [];
            for(let [id, props] of this._sitebar.entries()){
                let attrs = props.attrs
                buff.push(`<li><a href="#${name}" data-id="${props.id}" data-name="${props.name}">
                    <i class="${attrs.icon}"></i>
                    ${props.label}
                </a>`);
            }
            $dom.innerHTML = '<ul>'+ buff.join('') + '</ul>';
        }
    }
}


class UserNav{
    constructor(mediator, $dom){
        this.mediator = mediator;
        $dom.innerHTML = USER_NAV;

        this.$user = $dom.querySelector('.user-name');
        this.$logout = $dom.querySelector('a.logout-btn');
        this.logoutSubscription = dom.on(this.$logout, 'click', e => {
            e.preventDefault();
            this.logout()
        });
        this.$dom = $dom;
    }
    setUser(name){
        this.$user.innerHTML = name;
    }
    dispose(){
        this.logoutSubscription.unsubscribe();
        this.$dom.parentNode.removeChild(this.$dom);
        this.$logout = null;
        this.$dom = null;
        this.$user = null;
    }
    logout(){
        this.mediator.logout();
    }
}