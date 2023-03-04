
export function importStyles(style: string): () => void {
    const element = document.createElement('style');
    element.dataset.name = '@odss/terminal';
    element.innerHTML = style;
    document.head.appendChild(element);
    return () => {
        element.parentNode.removeChild(element);
    };
}