import {Component, Bind, Unbind, Requires} from '@odss/cdi';
import { Property } from '../odss-cdi';

class ISpellDictionary{
    checkWord(word) {

    }
}
class ISpellChecker {
    check(massage, language='en'){

    }
}
@Component(ISpellDictionary,
    properties={
        'language': 'en',
    }
)
@Property('language', 'en')
export class EnglishSpellDictionary {

    activate(ctx){
        this.dictionary = ["hello", "world", "welcome", "to", "the", "odss", "test"];
    }
    deactivate(ctx){
        this.dictionary = null;
    }
    checkWord(word) {
        return this.dictionary.indexOf(word) !== -1;
    }
}

@Component(ISpellDictionary)
@Property('language', 'pl')
export class PolishSpellDictionary {
    activate(ctx){
        this.dictionary = ["witaj", "świecie", "witaj", "w", "odss", "tescie"];
    }
    deactivate(ctx){
        this.dictionary = null;
    }
    checkWord(word) {
        return this.dictionary.indexOf(word) !== -1;
    }
}


@Component(ISpellChecker)
export class SpellChecker {
    constructor() {
        this.languages = new Map();
    }
    @Bind(ISpellDictionary)
    add(service, ref) {
        let language = ref.getProperty('language');
        this.languages.set(language, service);

    }
    @Unbind(ISpellDictionary)
    remove(service, ref) {
        let language = ref.getProperty('language');
        this.languages.delete(language);
    }
    activate(){
        console.log('A spell checker has been started')
    }
    deactivate(){
        console.log('A spell checker has been stopped')
    }

    check(message, language='en') {
        const dict = this.languages.get(lan);
        if (dict) {
            return message.split(' ').every(word => dict.checkWord(word));
        }
    }
}
