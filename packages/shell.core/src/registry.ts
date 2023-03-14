import { ICommand } from '@odss/common';
import { CommandNode } from './tree';


interface ResolveResult {
    command: ICommand,
    args: string[],
    name: string,
}

export class CommandsRegistry {
    private node = new CommandNode('root');

    hasCommand(id: string): boolean {
        return !!this.node.find(id.split('/'));
    }

    addCommand(command: ICommand): void {
        for(const id of this.getCommandIds(command)) {
            this.node.add(id.split('/'), command);
        }
    }
    removeCommand(command: ICommand): void {
        for (const id of this.getCommandIds(command)) {
            this.node.remove(id.split('/'));
        }
    }
    getCommandsNames(id: string = ''): string[] {
        if (id) {
            const node = this.node.find(id.split('/'));
            if (node) {
                return node.keys();
            }
        }
        return this.node.keys();
    }
    getCommand(id: string = ''): { name: string, command: ICommand } {
        const node = this.node.find(id.split('/'));
        if (node) {
            return { name: node.name, command: node.command };
        }
    }
    getCommands(id: string = ''): Map<string, ICommand> {
       const node = this.node.find(id.split('/'));
        if (node) {
            return node.entries();
        }
        return new Map();
    }

    resolve(line: string): ResolveResult {
        const args = line.split(' ');
        const ids = [];
        while(args.length) {
            ids.push(args.shift());
            const node = this.node.find([...ids]);
            if (!node) {
                break;
            }
            if (node.isLeaf()) {
                return { command: node.command, args, name: node.name };
            }
        }
    }


    private getCommandIds({ id, alias = [] }: ICommand): string[] {
        return [id, ...Array.isArray(alias) ? alias : [alias]];
    }
}

