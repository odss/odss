import View from './view';
import CommandAdapter from './adapter';

export default class Terminal{
    constructor(tpl){
        this.$dom = createView(tpl);
    }
    getName() {
        return 'Terminal';
    }
    show() {
        if (this.view) {
            this.view.show();
        }
    }
    hide() {
        if (this.view) {
            this.view.hide();
        }
    }
    activate(shell, tpl) {
        var adapter = new CommandAdapter(this, shell);
        this.view = new View(adapter, this.$dom);
        this.view.create();
    }
    deactivate() {
        if(this.view){
            this.view.dispose();
            this.view = null;
        }
    }
}
function createView(html) {
    var container = document.createElement('div');
    container.innerHTML = html.trim();
    return container.firstChild;
}