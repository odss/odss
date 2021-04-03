import { ShellService, ShellCommandsService, ICommand, IBundleContext, IServiceReference } from '@odss/common';

import Shell from './shell';
import { Commands } from './commands';
// import { Bind, Component, Invalidate, Provides, Validate } from '../../odss-decorators/dist/types';


let shell;
let tracker;

export function start(ctx: IBundleContext) {
    shell = new Shell();

    ctx.registerService(ShellService, shell);
    tracker = ctx.serviceTracker(ShellCommandsService, {
        addingService: function(command: ICommand) {
            shell.bindCommands(command);
        },
        modifiedService(): void { },

        removedService: function(command: ICommand) {
            shell.unbindCommands(command);
        }
    }).open();

    //create and register all core commands
    ctx.registerService(ShellCommandsService, new Commands(ctx, shell));


}

export function stop() {
    tracker.close();
    shell = null;
}

// @Component()
// @Provides(ShellService)
// class ShellComponent extends Shell {

//     @Validate()
//     validate() {

//     }
//     @Invalidate()
//     invalidate() {

//     }
//     @Bind()
//     bindCommand(command: ShellCommandService, ref: IServiceReference) {
//         const props = ref.getProperties<ICommandInfo>()
//         this.addCommand(command, props);
//     }
//     @Unbind()
//     unbindCommand(command: ShellCommandService, ref: IServiceReference) {
//         const { name } = ref.getProperties()
//         this.removeCommand(name);
//     }
// }