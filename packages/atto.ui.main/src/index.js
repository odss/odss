import UI from './ui';

export class Activator{
    start(){
        this.ui = new UI();
        this.ui.show();
    }
    stop(){
        this.ui.dispose();
        this.ui = null;

    }
}