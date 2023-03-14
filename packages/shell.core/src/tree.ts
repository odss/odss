import { ICommand } from '@odss/common';

export class CommandNode {

    public children: Map<string, CommandNode> = new Map();

    constructor(public readonly name: string, public readonly command?: ICommand) {}

    add(path: string[], command: ICommand) {
        const name = path.shift();
        if (path.length === 0) {
            if (this.children.has(name)) {
                throw new Error(`Command: ${command.id} is already registered`);
            }
            this.children.set(name, new CommandNode(name, command));

        } else {
            if (!this.children.has(name)) {
                this.children.set(name, new CommandNode(name));
            }
            this.children.get(name).add(path, command);
        }
    }
    remove(path: string[]) {
        const name = path.shift();
        if (path.length === 0) {
            if (!this.children.has(name)) {
                throw new Error(`Command: ${name} not exists`);
            }
            this.children.delete(name);
        } else {
            const child = this.children.get(name);
            child.remove(path);
            if (child.isEmpty() && !child.isLeaf()) {
                this.children.delete(name);
            }
        }
    }
    find(path: string[]) {
        const name = path.shift();
        if (name.length === 0) {
            return this;
        }
        if (path.length === 0) {
            return this.children.get(name);
        }
        if (this.children.has(name)) {
            return this.children.get(name).find(path);
        }
    }
    isEmpty() {
        return this.children.size === 0;
    }
    isLeaf(): boolean {
        return !!this.command;
    }
    keys() {
        return [...this.children.keys()];
    }
    values() {
        return [...this.children.values()].map(node => node.command);
    }
    entries() {
        return new Map(
            Array.from(this.children.entries())
                .map(([name, node]) => [name, node.command])
        );
    }
}
