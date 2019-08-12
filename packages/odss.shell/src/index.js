import { IShell, ICommand } from '@odss/api';
import Shell from './shell';
import commands from './commands';


let shell;
let tracker;

export function start(ctx) {
    shell = new Shell();

    ctx.registerService(IShell, shell);

    tracker = ctx.serviceTracker(ICommand, {
        addingService: function(reference) {
            shell.addCommand(ctx.getService(reference));
        },
        removedService: function(reference) {
            shell.removeCommand(ctx.getService(reference));
        }
    }).open();

    //create and register all core commands
    commands(ctx, shell).forEach(function(cmd){
        ctx.registerService(ICommand, cmd);
    });

}
export function stop() {
    shell = null;
    tracker.close();
}
