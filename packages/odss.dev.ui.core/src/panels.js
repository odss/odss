export default  class Panels{
    constructor($dom) {
        let $panels = $dom.querySelector('.panel-list');
        let panels = {};
        let actual = null;
        let state = false;

        let show = function(id) {
            panels[id].show();
            actual = id;
            let $active = $panels.querySelector('.pid-' + id);
            if ($active) {
                $active.classList.add('active');
            }
        };
        let hide = function(id) {
            panels[id].hide();
            actual = null;
            let $active = $panels.querySelector('.active');
            if ($active) {
                $active.classList.remove('active');
            }
        };

        let handler = function(e) {
            let $el = e.target;
            if ($el.classList.contains('panel')) {
                let pid = $el.dataset.pid;
                if (pid === actual) {
                    if (state) {
                        hide(pid);
                    } else {
                        show(pid);
                    }
                    state = !state;
                } else {
                    if (actual) {
                        hide(actual);
                    }
                    state = true;
                    show(pid);

                }
            }
        };

        $panels.addEventListener('click', handler, false);

        this.addPanel = function(id, panel) {
            id = id + '';
            let $panel = document.createElement('div');
            $panel.innerHTML = panel.getName();
            $panel.classList.add('panel');
            $panel.classList.add('pid-' + id);
            $panel.dataset.pid = id;
            $panels.appendChild($panel);
            panels[id] = panel;
            panel.close = function() {
                hide(id);
            };
        };
        this.removePanel = function(id) {
            id = id + '';
            let $panel = $panels.querySelector('.pid-' + id);
            $panels.removeChild($panel);
            delete panels[id];
            if (id === actual) {
                actual = null;
                state = false;
            }
        };
        this.dispose = function() {
            $panels.removeEventListener('click', handler, false);
        };
    }
}
