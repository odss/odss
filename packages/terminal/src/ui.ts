import { fromEvent } from '@stool/dom';
import { importStyles } from './styles';
import styles, { stylesheet } from './ui.css';

interface ToggleHandler {
    (status: boolean): void;
}

export class MainUI {
    private disposeStyles: () => void;
    private buttonSubscription: any;
    private dom: {
        root: HTMLElement,
        button: HTMLButtonElement,
        container: HTMLElement;
    };
    private listeners: Set<ToggleHandler> = new Set();

    start(): void {
        this.disposeStyles = importStyles(stylesheet);
        this.create();
        document.body.appendChild(this.dom.root);
    }
    stop(): void {
        this.buttonSubscription.unsubscribe();
        this.dom.root.parentNode.removeChild(this.dom.root);
        this?.disposeStyles();
    }
    activate(): void {
        this.dom.root.classList.add(styles.active);
        this.dom.button.disabled = false;
    }
    deactivate(): void {
        this.dom.button.disabled = true;
        this.dom.root.classList.remove(styles.active);
    }
    disposeContainer() {
        this.dom.container.innerHTML = '';
    }
    onToggle(listener: ToggleHandler) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    public getContainer(): HTMLElement {
        return this.dom.container;
    }
    private create(): void {
        const root = document.createElement('div');
        root.classList.add(styles.terminal);

        const button = document.createElement('button');
        button.classList.add(styles.button);
        button.innerHTML = 'Terminal';
        button.disabled = true;
        root.appendChild(button);
        let active = false;
        this.buttonSubscription = fromEvent(button, 'click').subscribe(() => {
            active = !active;
            const cls = this.dom.root.classList;
            active ? cls.add(styles.opened) : cls.remove(styles.opened)
            for(const listener of this.listeners) {
                listener(active);
            }
        });


        const container = document.createElement('div');
        container.classList.add(styles.container);
        root.appendChild(container);
        this.dom = {
            root,
            button,
            container,
        };
    }
}
