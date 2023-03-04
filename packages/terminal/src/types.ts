export interface IAddon {

}
export interface ITerminal {
    open(element: HTMLElement);
    write(line: string);
    loadAddon(addon: IAddon);
}
