import History from './history';
import Event from './event';
import {domEvents} from './dom';

    /**
     *
     * @param {HTMLElement} $dom
     * @constructor
     */
var View = function(adapter, $dom) {
        this.$dom = $dom;
        this.$content = $dom.querySelector('.content');
        this._adapter = adapter;
        this._isCreate = false;

    };

    View.prototype = {
        show: function() {
            this.$dom.style.display = 'block';
        },
        hide: function() {
            this.$dom.style.display = 'none';
        },
        create: function() {
            if (this._isCreate) {
                return;
            }
            this._isCreate = true;
            this.history = new History();
            this.output = new Output(this.$dom);
            this.inputer = new Inputer(this.$dom);
            this.drag = new Drag(this.$dom);
            this.inputer.on.add(function(event) {
                var value;
                switch (event.type) {
                    case 'tab':
                        this._adapter.complete(event.value);
                        break;
                    case 'enter':
                        if (event.value === 'clear') {
                            this.inputer.clear();
                            this.output.clear();
                            return;
                        }
                        this.output.text(this.inputer.text());
                        this.inputer.clear();
                        this._checkScroll();
                        this.history.add(event.value);
                        this._adapter.execute(event.value);
                        break;
                    case 'key':
                        break;
                    case 'blur':
                        break;
                    case 'down':
                        value = this.history.next();
                        if (value) {
                            this.inputer.text(value);
                        }
                        break;
                    case 'up':
                        value = this.history.prev();
                        if (value) {
                            this.inputer.text(value);
                        }
                        break;
                }
            }, this);


            document.body.appendChild(this.$dom);

            this.drag.start();
            this.output.start();
            domEvents.on(this.$dom, 'click', this._onClick, this);
            this._adapter.on.add(this._onAdapter, this);
        },
        dispose: function() {

            this._adapter.on.remove(this._onAdapter, this);
            domEvents.off(this.$dom, 'click', this._onClick, this);

            this.drag.stop();
            this.output.stop();

            this.inputer.dispose();
            this.$dom.parentNode.removeChild(this.$dom);
            this.$dom = null;
            this._isCreate = false;
        },
        _onAdapter: function(event) {
            switch (event.type) {
                case 'success':
                    this.output.text(event.value);
                    break;
                case 'error':
                    this.output.error(event.value);

                    break;
                case 'complete':
                    if (event.output) {
                        this.output.text(this.inputer.text());
                        this.output.text(event.output);
                    }
                    this.inputer.complete(event.input);
                    break;
            }
            this._checkScroll();
        },
        _checkScroll: function(event) {
            var diff = this.$content.scrollHeight - this.$content.offsetHeight;
            if (diff > 0) {
                this.$content.scrollTop = diff;
            }
        },
        _onClick: function(e) {

            if (!e.isRight && !e.target.classList.contains('head')) {
                if (e.target.dataset.cmd) {
                    switch (e.target.dataset.cmd) {
                        case 'hide':
                            //was overwrite by plugin service
                            this._adapter.close();
                            break;
                        case 'maximize':
                            this.drag.save();
                            this.$dom.classList.add('maximize');
                            break;
                        case 'minimaze':
                            this.$dom.classList.remove('maximize');
                            this.drag.revert();
                            break;
                    }
                } else {
                    this.inputer.focus();
                }

            }
        }
    };
    var Drag = function($dom) {
        this.$dom = $dom;
        this.$handler = this.$dom.querySelector('.head');

        this.pos = {};
        this.start = function() {
            var pos = findPosition(this.$dom);
            this.pos.start = {
                x: pos.x,
                y: pos.y
            };
            this.pos.move = {
                x: 0,
                y: 0
            };
            this.$dom.style.transform = 'translate(' + this.pos.start.x + 'px,' + this.pos.start.y + 'px)';
            this.$dom.style.left = '0px';
            this.$dom.style.top = '0px';

            domEvents.on(this.$handler, 'mousedown', this.onMouseDown, this);
        };
        this.stop = function() {
            domEvents.off(this.$handler, 'mouseup', this.onMouseUp, this);
            this.$dom = null;
            this.$handler = null;
            this.pos = null;
        };
        this.save = function() {
            this.lock = true;
            this.$dom.style.transform = '';
        };
        this.revert = function() {
            this.lock = false;
            this.$dom.style.transform = 'translate(' + (this.pos.start.x) + 'px,' + (this.pos.start.y) + 'px)';
        };
    };
    Drag.prototype = {
        onMouseUp: function(e) {
            domEvents.off(document.body, 'mouseup', this.onMouseUp, this);
            domEvents.off(document.body, 'mousemove', this.onMouseMove, this);
            this.pos.start.x = this.pos.move.x;
            this.pos.start.y = this.pos.move.y;
            this.$dom.classList.remove('drag');
        },
        onMouseMove: function(e) {
            //calculate diff
            var dx = e.page.x - this.pos.down.x;
            var dy = e.page.y - this.pos.down.y;
            this.pos.move.x = this.pos.start.x + dx;
            this.pos.move.y = this.pos.start.y + dy;
            this.$dom.style.transform = 'translate(' + (this.pos.move.x) + 'px,' + (this.pos.move.y) + 'px)';

            if (!this.$dom.classList.contains('drag')) {
                this.$dom.classList.add('drag');
            }
        },
        onMouseDown: function(e) {
            if (this.lock) {
                return;
            }
            //set start point
            this.pos.down = {
                x: e.page.x,
                y: e.page.y
            };
            domEvents.on(document.body, 'mouseup', this.onMouseUp, this);
            domEvents.on(document.body, 'mousemove', this.onMouseMove, this);

        }
    };
    var Output = function($dom) {
        this.$dom = $dom.querySelector('.output');
    };
    Output.prototype = {
        clear: function() {
            this.$dom.innerHTML = '';
        },
        start: function() {
            domEvents.on(this.$dom.parentNode, 'mousewheel', this.onMouseWheel, this);
        },
        stop: function() {
            domEvents.off(this.$dom.parentNode, 'mousewheel', this.onMouseWheel, this);
            this.$dom = null;
        },
        text: function(msg) {
            this._out('text', msg);
        },
        error: function(msg) {
            if (msg instanceof Error) {
                var stack = msg.stack;
                if (stack) {
                    msg += '<div class="stack">' + stack + '</div>';
                }
            }
            this._out('error', msg, true);
        },
        onMouseWheel: function(e) {
            this.$dom.parentNode.scrollTop -= (e.wheel * 20);
        },

        _out: function(type, msg, raw) {
            var line = document.createElement('div');
            line.classList.add(type);
            line.innerHTML = raw ? msg : msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br />');
            this.$dom.appendChild(line);
        }
    };

    var Inputer = function($dom) {
        this.on = new Event();

        this.$dom = $dom.querySelector('input');
        domEvents.on(this.$dom, 'keydown', this.onKeyDown, this);
        domEvents.on(this.$dom, 'keyup', this.onKeyUp, this);
        domEvents.on(this.$dom, 'focus', this.onFocus, this);
        domEvents.on(this.$dom, 'blur', this.onBlur, this);
    };
    Inputer.prototype = {
        onKeyDown: function(e) {
            if (e.key === 'tab') {
                e.stop();
            }
        },
        onKeyUp: function(e) {
            e.stop();
            var type = 'key';
            switch (e.key) {
                case 'enter':
                case 'tab':
                case 'up':
                case 'down':
                    type = e.key;
                    break;
            }
            this._trigger(type);
        },
        onFocus: function() {
            this._trigger('focus');
        },
        onBlur: function() {
            this._trigger('blur');
        },
        complete: function(line) {
            this.$dom.value = line;
        },
        focus: function() {
            this.$dom.focus();
        },
        clear: function() {
            var text = this.text();
            this.$dom.value = '';
            return text;

        },
        text: function(text) {
            if (typeof text === 'undefined') {
                return '> ' + this.$dom.value;
            } else {
                this.$dom.value = text;
            }
        },
        dispose: function() {
            domEvents.off(this.$dom, 'keydown', this.onKeyDown, this);
            domEvents.off(this.$dom, 'keyup', this.onKeyUp, this);
            domEvents.off(this.$dom, 'focus', this.onFocus, this);
            domEvents.off(this.$dom, 'blur', this.onBlur, this);
        },
        _trigger: function(type, value) {
            value = value || this.$dom.value;
            this.on.trigger({
                type: type,
                value: value
            });
        }
    };


    function findPosition(el) {
        var rect = el.getBoundingClientRect();
        rect.x = rect.left;
        rect.y = rect.top;
        if (typeof rect.width === 'undefined') {
            rect.width = rect.right - rect.left;
            rect.height = rect.bottom - rect.top;
        }
        return rect;
    }
export default View;