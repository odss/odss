import {IPanel} from 'odss.dev.ui.api';
import MAIN_TEMPLATE from './main.html';
import Panels from './panels';
import {createView} from './view';
import CSS from './main.scss';


let panels, tracker, styles;

export function start(ctx) {
    styles = ctx.styles(CSS);
    let $dom = createView(MAIN_TEMPLATE);
    panels = new Panels($dom);
    tracker = ctx.serviceTracker(IPanel, {
        addingService: function(reference) {
            panels.addPanel(reference.id, ctx.getService(reference));
        },
        removedService: function(reference) {
            panels.removePanel(reference.id);
        }
    }).open();
}

export function stop(ctx) {
    tracker.close();
    panels.dispose();
    styles.dispose();
}
