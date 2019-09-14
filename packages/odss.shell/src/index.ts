import { IShell, ICommand } from '@odss/api';

import Shell from './shell';
import { AllCommands } from './commands';
import { getTargetProps } from './decorators';


let shell;
let tracker;

export function start(ctx) {
    shell = new Shell();

    ctx.registerService(IShell, shell);

    tracker = ctx.serviceTracker(ICommand, {
        addingService: function(reference) {
            const command = ctx.getService(reference);
            shell.addCommand(command);
        },
        removedService: function(reference) {
            shell.removeCommand(ctx.getService(reference));
        }
    }).open();

    //create and register all core commands
    AllCommands.forEach(Command => {
        // const props = getTargetProps(Command);
        ctx.registerService(ICommand, new Command(ctx, shell));
    });

}

export function stop() {
    tracker.close();
    shell = null;
}
