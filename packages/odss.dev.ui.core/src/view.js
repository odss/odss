export function createView(html) {
    var container = document.createElement('div');
    container.innerHTML = html.trim();
    var $dom = container.firstChild;
    document.body.appendChild($dom);
    return $dom;
}
