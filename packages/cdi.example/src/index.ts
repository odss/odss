import { IBundleContext, IServiceReference } from '@odss/common';
import { Component, Bind, Unbind, Provides, Validate, Invalidate, Property } from '@odss/cdi-decorators';


class ISpellDictionaryService {};// = 'odss.cdi.example.ISpellDictionary';
class ISpellCheckerService{};// = 'odss.cdi.example.Checker';


interface ISpellDictionary {
    checkWord(word: string): boolean;
}

interface ISpellChecker {
    check(massage: string, language: string): boolean;
}

@Component()
@Provides(ISpellDictionaryService, {language:'en'})
export class EnglishSpellDictionary {

    // @Property('a.b.c')
    private name: string = '';

    private dictionary: string[] = [];

    @Validate()
    activate(ctx: IBundleContext){
        this.dictionary = ["hello", "world", "welcome", "to", "the", "odss", "test"];
        console.log('A EnglishSpellDictionary has been started');
    }

    @Invalidate()
    deactivate(ctx: IBundleContext){
        this.dictionary = [];
    }

    checkWord(word: string): boolean {
        return this.dictionary.indexOf(word) !== -1;
    }
}

@Component()
@Provides(ISpellDictionaryService, {'language': 'pl'})
export class PolishSpellDictionary {
    private dictionary: string[] = [];

    @Validate()
    activate(ctx: IBundleContext){
        this.dictionary = ["witaj", "świecie", "witaj", "w", "odss", "tescie"];
        console.log('A PolishSpellDictionary has been started');
    }
    @Invalidate()
    deactivate(ctx: IBundleContext){
        this.dictionary = [];
    }
    checkWord(word: string) {
        return this.dictionary.indexOf(word) !== -1;
    }
}


@Component()
@Provides(ISpellCheckerService)
export class SpellChecker {

    private languages: Map<string, ISpellDictionary> = new Map();

    @Bind(ISpellDictionaryService)
    add(service: ISpellDictionary, ref: IServiceReference) {
        let language = ref.getProperty<string>('language');
        console.log(`SpellChecker.add(${language})`);
        this.languages.set(language, service);

    }
    @Unbind(ISpellDictionaryService)
    remove(service: ISpellDictionary, ref: IServiceReference) {
        let language = ref.getProperty<string>('language');
        console.log(`SpellChecker.remove(${language})`);
        this.languages.delete(language);
    }

    @Validate()
    activate(): void {
        console.log('A spell checker has been started');
    }

    @Invalidate()
    deactivate(): void {
        console.log('A spell checker has been stopped');
    }

    check(message: string, language: string = 'en'): boolean {
        const dict = this.languages.get(language);
        if (dict) {
            return message.split(' ').every(word => dict.checkWord(word));
        }
        return false;
    }
}


@Component()
export class SpellCheckerTest {
    constructor(private checker: ISpellCheckerService) {
        console.log('SpellCheckerTest', checker);
    }
}
