export function importStyles(styles: string[]): () => void {
    const element = document.createElement('style');
    element.dataset.name = '@odss/terminal';

    element.innerHTML = styles.join('\n\n');
    document.head.appendChild(element);
    return () => {
        element.parentNode.removeChild(element);
    };
}
