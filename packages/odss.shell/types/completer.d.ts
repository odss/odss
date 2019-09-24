import { IShell } from "@odss/api";
export default class Completer {
    private shell;
    constructor(shell: IShell);
    complete(line: string): Promise<string[]>;
    complete3(line: string): Promise<any>;
}
