import { IPanel } from '@odss/dev.ui.api';
import MAIN_TEMPLATE from './main.html';
import Panels from './panels';
import { createView } from './view';
import CSS from './main.scss';


export class Activator {
    start(ctx) {
        ctx.registerStyle(CSS);
        let $dom = createView(MAIN_TEMPLATE);
        this.panels = new Panels($dom);
        this.tracker = ctx.serviceTracker(IPanel, {
            addingService: reference => {
                this.panels.addPanel(reference.id, ctx.getService(reference));
            },
            removedService: reference => {
                this.panels.removePanel(reference.id);
            }
        }).open();
    }
    stop(ctx) {
        this.tracker.close();
        this.panels.dispose();
    }
}
