import {IPanel} from 'odss.dev.ui.api';
import {IShell} from 'odss.api';
import Termial from './terminal';
import MAIN_TEMPLATE  from './tpl/main.html';
import STYLES from './css/main.scss';


var terminal, reg, tracker;

export function start(ctx) {
    terminal = new Termial(MAIN_TEMPLATE);
    tracker = ctx.serviceTracker(IShell, {
        addingService: function(reference) {
            terminal.activate((ctx.getService(reference)));

        },
        removedService: function(reference) {
            terminal.deactivate();
        }
    }).open();
    reg = ctx.registerService(IPanel, terminal);
}
export function stop(ctx) {
    terminal.deactivate();
    terminal = null;
    reg.unregister();
    reg = null;
}
