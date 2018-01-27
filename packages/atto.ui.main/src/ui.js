
import './main.scss'
import TEMPLATE from './main.html'


export default class UI{
    constructor(mediator){
        this.mediator = mediator
    }
    show(){
        const $div = document.createElement('div')
        $div.innerHTML = TEMPLATE.trim()
        this.$dom = $div.firstChild
        document.body.appendChild(this.$dom);

        // this.$form = this.$dom.querySelector('#login-form')
        // this.$form.addEventListener('submit', this.onSubmit, false)
    }
    dispose(){
        // this.$form.removeEventListener('submit', this.onSubmit)
        // document.body.removeChild(this.$dom)
        // document.body.classList.remove('login')
        // this._template = ''
        // this.onSubmit = null
        // this.$dom = null
        // this.$form = null
    }
}
