import { IBundleContext, IServiceReference } from '@odss/common';
import { Component, Bind, Unbind, Provide, Property } from '@odss/cdi';


const ISpellDictionary = 'odss.cdi.example.ISpellDictionary';
const ISpellChecker = 'odss.cdi.example.Checker';

interface ISpellDictionary {
    checkWord(word: string): boolean;
}

interface ISpellChecker {
    check(massage: string, language: string): boolean;
}

@Component()
@Provide(ISpellDictionary)
@Property('language', 'en')
export class EnglishSpellDictionary {
    private dictionary: string[] = [];

    activate(ctx: IBundleContext){
        this.dictionary = ["hello", "world", "welcome", "to", "the", "odss", "test"];
    }
    deactivate(ctx: IBundleContext){
        this.dictionary = [];
    }
    checkWord(word: string): boolean {
        return this.dictionary.indexOf(word) !== -1;
    }
}

@Component(ISpellDictionary)
@Property('language', 'pl')
export class PolishSpellDictionary {
    private dictionary: string[] = [];

    activate(ctx: IBundleContext){
        this.dictionary = ["witaj", "świecie", "witaj", "w", "odss", "tescie"];
    }
    deactivate(ctx: IBundleContext){
        this.dictionary = [];
    }
    checkWord(word: string) {
        return this.dictionary.indexOf(word) !== -1;
    }
}


@Component(ISpellChecker)
export class SpellChecker {

    private languages: Map<string, ISpellDictionary> = new Map();

    @Bind(ISpellDictionary)
    add(service: ISpellDictionary, ref: IServiceReference) {
        let language = ref.getProperty('language');
        this.languages.set(language, service);

    }
    @Unbind(ISpellDictionary)
    remove(service: ISpellDictionary, ref: IServiceReference) {
        let language = ref.getProperty('language');
        this.languages.delete(language);
    }
    activate(): void {
        console.log('A spell checker has been started')
    }
    deactivate(): void {
        console.log('A spell checker has been stopped')
    }

    check(message: string, language: string = 'en'): boolean {
        const dict = this.languages.get(language);
        if (dict) {
            return message.split(' ').every(word => dict.checkWord(word));
        }
        return false;
    }
}

