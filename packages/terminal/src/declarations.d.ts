declare module '*.css';

interface AutocompleteHandler {
    (index: number, tokens: string[], ...args: any[]): string[];
}
export declare class LocalEchoController {
    addAutocompleteHandler(handler: AutocompleteHandler): void;
}
