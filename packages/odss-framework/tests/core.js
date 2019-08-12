import * as sinon from 'sinon';
import { Framework } from '../src/framework';


let ACTIVATORS = {
    event: function() {
        return {
            start: function(ctx) {
                ctx.on.framework.add(() => {});
                ctx.on.bundle.add(() => {});
                ctx.on.service.add(() => {});
                ctx.registerService('test', 'service.test');
            },
            stop: function(/* ctx */) {

            }
        };
    },
    error_start: function() {
        return {
            start: function(/* ctx */) {
                throw new Error('start');
            }
        };
    },
    error_stop: function() {
        return {
            stop: function(/* ctx */) {
                throw new Error('stop');
            }
        };
    },
    service: function() {
        return {
            start: function(ctx) {
                this.reg = ctx.registerService('test', 'service-test');
            },
            stop: function() {
                this.reg.unregister();
            }
        };
    },
    spy: function() {
        return {
            _spy: function() {
                if (!this.spy) {
                    this.spy = {
                        start: sinon.spy(),
                        stop: sinon.spy()
                    };
                }
                return this.spy;
            },
            start: function() {
                this._spy().start();
            },
            stop: function() {
                this._spy().stop();
            }
        };
    }
};

const CONFIGS = {
    event: {
        'name': 'TestActivate',
        'namespace': 'event',
        'activator': 'event'
    },
    'error.start': {
        'name': 'TestActivate',
        'namespace': 'error.start',
        'activator': 'error_start'
    },
    'error.stop': {
        'name': 'TestActivate',
        'namespace': 'error.stop',
        'activator': 'error_stop'
    },
    spy: {
        'name': 'SpyActivate',
        'namespace': 'spy',
        'activator': 'spy'
    },
    service: {
        'name': 'ServiceActivate',
        'namespace': 'service',
        'activator': 'service'
    },
    'service.next': {
        'name': 'ServiceActivate',
        'namespace': 'service.next',
        'activator': 'service'
    },
    listeners: {
        'name': 'TestActivate',
        'namespace': 'listeners',
        'activator': 'service'
    },
    def: {
        'name': 'TestActivate',
        'namespace': 'def',
        'activator': 'event'
    },
    noactivator: {
        'name': 'NotActivatorActivate',
        'namespace': 'noactivator',
    },
    api: {
        'name': 'api',
        'namespace': 'api'
    },
    include: {
        'name': 'include',
        'namespace': 'include'
    }
};

function findConfig(location) {

    let config = location in CONFIGS ? CONFIGS[location] : CONFIGS.def;
    let buff = {};
    for (let i in config) {
        buff[i] = config[i];
    }
    buff.name += '-' + location;
    buff.location = location;
    buff.version = '1.0.0';
    buff.start = function() {};
    buff.stop = function() {};
    if (location in ACTIVATORS) {
        buff.start = ACTIVATORS[location].start || function() {};
        buff.stop = ACTIVATORS[location].stop || function() {};
    }
    return buff;
}

class Loader {
    constructor(root) {
        this.root = root;
    }
    loadBundle(location) {
        let config = findConfig(location);
        if (config) {
            return Promise.resolve(config);
        }
        return Promise.reject(`Not found: ${location}`);
    }
    unloadBundle(){}
    loadStyles(/* bundle */) {}
    removeStyles(/* bundle */) {}
}

let tests = {
    framework: async function(autoStart) {
        let loader = new Loader();
        let framework = new Framework({
            prop1: 'test1',
            prop2: 'test2'
        });

        framework.setLoader(loader);
        if (autoStart) {
            await framework.start();
        }
        return framework;
    },
    bundle: async function(namespace, autoStart) {
        namespace = namespace || 'def';
        let framework = await this.framework(autoStart);
        await framework.installBundle(namespace, autoStart);
        return framework.getBundle(namespace);
    },
    factory: async function() {
        let framework = await this.framework();
        return {
            bundle: async function(namespace, autoStart) {
                await framework.installBundle(namespace, autoStart);
                return framework.getBundle(namespace);
            },
            framework: async function(noStart) {
                if (!noStart) {
                    await framework.start();
                }
                return framework;
            },
            events: function() {
                return framework.on;
            },
            reg: function() {
                return framework.registry;
            }
        };
    }
};


export default tests;
