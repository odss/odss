import {IShell, ICommand} from 'odss.api';
import Shell from './shell';
import commands from './commands';


let shell;
let tracker;

export function start(ctx) {
    //create service
    shell = new Shell();

    //register created shell service
    ctx.registerService(IShell, shell);

    //listern for added services ICommand
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
