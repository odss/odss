"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importStyles = void 0;
function importStyles(styles) {
    const element = document.createElement('style');
    element.dataset.name = '@odss/terminal';
    element.innerHTML = styles.join('\n\n');
    document.head.appendChild(element);
    return () => {
        element.parentNode.removeChild(element);
    };
}
exports.importStyles = importStyles;
