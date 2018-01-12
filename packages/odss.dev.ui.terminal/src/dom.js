var uid = (function() {
    var id = 0;
    return function($element) {
        return $element.$$domuid || ($element.$$domuid = id += 1);
    };
})();
function isEventSupport() {
    
    var el = document.createElement('div');
    var cacheSupport = {};

    return function(name) {
        if (name in cacheSupport) {
            return true;
        }
        var el = window;
        var ename = 'on' + name.toLowerCase();
        var isSupport = false;
        if (ename in el) {

            isSupport = true;
        } else {
            if (el.setAttribute) {
                el.setAttribute(ename, 'return;');
                isSupport = typeof el[ename] === 'function';
                el.removeAttribute(ename);
            }
        }
        cacheSupport[name] = isSupport;
        return isSupport;
    };
};

var $nativeTypes = new Set(['unload', 'beforeunload', 'resize', 'DOMContentLoaded', 'hashchange', 'popstate', 'error', 'abort', 'scroll', 'message']);

var CODES = {
    38: 'up',
    39: 'right',
    40: 'down',
    37: 'left',
    16: 'shift',
    17: 'control',
    18: 'alt',
    9: 'tab',
    13: 'enter',
    36: 'home',
    35: 'end',
    33: 'pageup',
    34: 'pagedown',
    45: 'insert',
    46: 'delete',
    27: 'escape',
    32: 'space',
    8: 'backspace'
};
function customEvent(e, ctype) {

    var target = e.target;
    while (target && target.nodeType === 3) {
        target = target.parentNode;
    }

    var api = {
        e: e,
        type: ctype || e.type,
        shift: e.shiftKey,
        control: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
        target: e.target,
        related: e.relatedTarget,
        page: null,
        client: null
    };
    var type = e.type;
    if (type.indexOf('key') === 0) {
        var code = e.which || e.keyCode;
        if (CODES[code]) {
            api.key = CODES[code];
        } else if (type === 'keydown' || type === 'keyup') {
            if (code > 111 && code < 124) {
                api.key = 'f' + (code - 111);
            } else if (code > 95 && code < 106) {
                api.key = code - 96;
            } else {
                api.key = String.fromCharCode(code).toLowerCase();
            }
        }
    } else if (type === 'click' || type === 'dbclick' || type.indexOf('mouse') === 0 || type === 'DOMMouseScroll' || type === 'wheel' || type === 'contextmenu') {
        var doc = (!document.compatMode || document.compatMode === 'CSS1Compat') ? document.html : document.body;
        api.page = {
            x: (e.pageX !== null) ? e.pageX : e.clientX + doc.scrollLeft,
            y: (e.pageY !== null) ? e.pageY : e.clientY + doc.scrollTop
        };
        api.client = {
            x: (e.pageX !== null) ? e.pageX - window.pageXOffset : e.clientX,
            y: (e.pageY !== null) ? e.pageY - window.pageYOffset : e.clientY
        };
        api.isRight = (e.which === 3 || e.button === 2);
        if (type === 'mouseover' || type === 'mouseout') {

        } else if (e.type === 'mousewheel' || e.type === 'DOMMouseScroll' || e.type === 'wheel') {
            api.wheel = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
            if (e.axis) {
                if (e.axis === e.HORIZONTAL_AXIS) {
                    api.axis = "horizontal";
                } else {
                    api.axis = "vertical";
                }
            } else if (e.wheelDeltaX && e.wheelDeltaX === e.wheelDelta) {
                api.axis = "horizontal";
            } else {
                api.axis = "vertical";
            }
        }
    } else if (type.indexOf('touch') === 0 || type.indexOf('gesture') === 0) {
        api.touch = {
            rotation: e.rotation,
            scale: e.scale,
            target: e.targetTouches,
            changed: e.changedTouches,
            touches: e.touches,
        };
        var touches = e.touches;
        if (touches && touches[0]) {
            var touch = touches[0];
            api.touch.page = {
                x: touch.pageX,
                y: touch.pageY
            };
            api.touch.client = {
                x: touch.clientX,
                y: touch.clientY
            };
        }
    }
    api.preventDefault = e.preventDefault.bind(e);
    api.stopPropagation = e.stopPropagation.bind(e);
    api.stop = function() {
        e.preventDefault();
        e.stopPropagation();
    };
    return api;
};



function getType(type) {
    if (type === 'mousewheel') {
        if (!isEventSupport('mousewheel')) {
            type = 'DOMMouseScroll';
        }
    }
    return type;
};


var listeners = (function() {

    var $group = {};

    return {
        target: function(uid) {
            var buff = [];
            for (var name in $group) {
                if (name.indexOf(uid) === 1) {
                    buff.extend($group[name]);
                }
            }
            return buff;
        },
        type: function(uid, type) {
            var sid = '_' + uid + '_' + type;
            if (!(sid in $group)) {
                $group[sid] = [];
            }
            return {
                findAll: function() {
                    return $group[sid].concat();
                },
                contains: function(callback) {
                    var listeners = $group[sid];
                    for (var i = 0; i < listeners.length; i += 1) {
                        if (listeners[i].callback === callback) {
                            return true;
                        }
                    }

                    return false;
                },
                find: function(callback) {

                    var listeners = $group[sid];
                    for (var i = 0; i < listeners.length; i += 1) {
                        if (listeners[i].callback === callback) {
                            return listeners[i];
                        }
                    }
                    return null;
                },
                remove: function(callback) {
                    var listeners = $group[sid];
                    for (var i = 0; i < listeners.length; i += 1) {
                        if (listeners[i].callback === callback) {
                            var tmp = listeners[i];
                            listeners.splice(i, 1);
                            return tmp;
                        }
                    }
                    return null;
                },
                add: function(type, callback, handler, bind) {
                    if (!this.contains(callback)) {
                        $group[sid].push({
                            type: type,
                            callback: callback,
                            handler: handler,
                            bind: bind
                        });
                    }
                }
            };
        }
    };
})();


function addEvent(target, type, callback, bind) {
    bind = bind || null;

    var listeners = removeEvent(target, type, callback);
    var handler = $nativeTypes.has(type) ? callback.bind(bind) : function(e) {
        callback.call(bind, customEvent(e, type));
    };

    target.addEventListener(getType(type), handler, false);
    listeners.add(type, callback, handler, bind);

    return {
        remove: function() {
            removeEvent(target, type, callback);
        }
    };
}


function removeEvent(target, type, callback) {
    var items = listeners.type(uid(target), type);
    var listener = items.remove(callback);
    if (listener !== null) {
        target.removeEventListener(getType(type), listener.handler, false);
    }
    return items;
};

export var domEvents = {
    on: function(target, type, callback, bind) {
        return addEvent(target, type, callback, bind);
    },
    ons:function(target, items) {
        for (var name in items) {
            addEvent(target, name, items[name]);
        }
    },
    once: function(target, type, callback, bind) {
        var handler = addEvent(target, type, function(e) {
            callback(e);
            handler.remove();
        }, bind);
    return handler;
    },
    off: function(target, type, callback, bind) {
        removeEvent(target, type, callback, bind);
    },
    offs: function(target, types) {
        var items = [];
        var uid = uid(target);
        if (typeof types === 'undefined') {
            items = listeners.target(uid);
        } else {
            if (typeof types === 'string') {
                types = types.trim().split(' ').unique();
            }
            for (var t = 0; t < types.length; t += 1) {
                items.extend(listeners.type(uid, types[t]).findAll());
            }
        }
        for (var i = 0; i < items.length; i += 1) {
            removeEvent(target, items[i].type, items[i].callback);
        }
    }
};
