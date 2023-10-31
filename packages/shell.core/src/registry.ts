import { ICommand } from '@odss/common';
import { toPath } from './utils';
import { CommandNode } from './tree';

interface ResolveResult {
    node: CommandNode,
    command: ICommand,
    args: string[],
}

export class CommandsRegistry {
    private node = new CommandNode('root');

    hasCommand(id: string): boolean {
        return !!this.node.find(toPath(id));
    }

    addCommand(command: ICommand): void {
        for(const id of this.getCommandIds(command)) {
            this.node.add(toPath(id), command);
        }
    }
    removeCommand(command: ICommand): void {
        for (const id of this.getCommandIds(command)) {
            this.node.remove(toPath(id));
        }
    }
    getNode(path: string | string[] = []): CommandNode {
        return this.node.find(toPath(path));
    }
    resolve(line: string): ResolveResult {
        const path = toPath(line);
        const ids = [...path];
        const args = [];
        while(ids.length) {
            const node = this.node.find(ids);
            if (node) {
                if (node.isLeaf()) {
                    return { node, command: node.command, args };
                }
            }
            args.unshift(ids.pop());
        }
    }
    private getCommandIds({ id, alias = [] }: ICommand): string[] {
        return [id, ...Array.isArray(alias) ? alias : [alias]];
    }
}

