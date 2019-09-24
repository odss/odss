import { IServiceReference, IBundleContext } from '@odss/common';
import { ICommand, ShellService, CommandService } from '@odss/api';

import Shell from './shell';
import { AllCommands } from './commands';


let shell;
let tracker;

export function start(ctx: IBundleContext) {
    shell = new Shell();

    ctx.registerService(ShellService, shell);

    tracker = ctx.serviceTracker(CommandService, {
        addingService: function(reference: IServiceReference, command: object) {
            shell.addCommand(command);
        },
        modifiedService(reference: IServiceReference, service: Object): void { },

        removedService: function(reference: IServiceReference, command: object) {
            shell.removeCommand(command);
        }
    }).open();

    //create and register all core commands
    AllCommands.forEach(Command => {
        ctx.registerService(CommandService, new Command(ctx, shell));
    });

}

export function stop() {
    tracker.close();
    shell = null;
}
