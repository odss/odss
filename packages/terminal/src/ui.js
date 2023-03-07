"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainUI = void 0;
const dom_1 = require("@stool/dom");
const styles_1 = require("./styles");
const xterm_css_1 = require("../vendors/xterm.css");
const ui_module_css_1 = require("./ui.module.css");
class MainUI {
    disposeStyles;
    buttonSubscription;
    dom;
    listeners = new Set();
    start() {
        this.disposeStyles = (0, styles_1.importStyles)([ui_module_css_1.stylesheet, xterm_css_1.stylesheet]);
        this.create();
        document.body.appendChild(this.dom.root);
    }
    stop() {
        this.buttonSubscription.unsubscribe();
        this.dom.root.parentNode.removeChild(this.dom.root);
        this?.disposeStyles();
    }
    activate() {
        this.dom.root.classList.add(ui_module_css_1.default.active);
        this.dom.button.disabled = false;
    }
    deactivate() {
        this.dom.button.disabled = true;
        this.dom.root.classList.remove(ui_module_css_1.default.active);
    }
    disposeContainer() {
        this.dom.container.innerHTML = '';
    }
    onToggle(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    getContainer() {
        return this.dom.container;
    }
    create() {
        const root = document.createElement('div');
        root.classList.add(ui_module_css_1.default.terminal);
        const button = document.createElement('button');
        button.classList.add(ui_module_css_1.default.button);
        button.innerHTML = 'Terminal';
        button.disabled = true;
        root.appendChild(button);
        let active = false;
        this.buttonSubscription = (0, dom_1.fromEvent)(button, 'click').subscribe(() => {
            active = !active;
            const cls = this.dom.root.classList;
            active ? cls.add(ui_module_css_1.default.opened) : cls.remove(ui_module_css_1.default.opened);
            for (const listener of this.listeners) {
                listener(active);
            }
        });
        const container = document.createElement('div');
        container.classList.add(ui_module_css_1.default.container);
        root.appendChild(container);
        this.dom = {
            root,
            button,
            container,
        };
    }
}
exports.MainUI = MainUI;
